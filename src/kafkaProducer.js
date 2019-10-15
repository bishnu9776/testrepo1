import R from "ramda"
import {bindNodeCallback, forkJoin, merge, Observable, of, throwError} from "rxjs"
import {bufferTime, catchError, concatAll, concatMap, filter, finalize, flatMap, switchMap} from "rxjs/operators"
import {ErrorCodes as kafkaErrorCodes, Producer as KafkaProducer} from "vi-kafka-stream-client"
import {ACK_MSG_TAG} from "./constants"
import {errorFormatter} from "./utils/errorFormatter"

const {env} = process
const DefaultProducer = (globalConfig, topicConfig) => new KafkaProducer(globalConfig, topicConfig)

export const getKafkaProducer = ({log, Producer = DefaultProducer, metricRegistry}) => {
  const config = {
    dataTopics: env.VI_KAFKA_SINK_DATA_TOPIC ? [env.VI_KAFKA_SINK_DATA_TOPIC] : ["test-topic-ather"],
    bufferTimeSpan: Number.parseInt(env.VI_PRODUCER_BUFFER_TIME_SPAN, 10) || 5000,
    "vi-kafka-stream-client-options": {
      globalConfig: {
        "metadata.broker.list": env.VI_KAFKA_URL || "localhost:9092",
        "client.id": env.VI_KAFKA_SINK_CLIENT_ID || "ather-test",
        "retry.backoff.ms": parseInt(env.VI_KAFKA_SINK_RETRY_BACKOFF_MS, 10) || 500,
        "message.send.max.retries": parseInt(env.VI_KAFKA_SINK_MESSAGE_SEND_MAX_RETRIES, 10) || 10, // retry for 5 mins
        "queue.buffering.max.ms": parseInt(env.VI_KAFKA_SINK_QUEUE_BUFFERING_MAX_MS, 10) || 500,
        "queue.buffering.max.messages": parseInt(env.VI_KAFKA_SINK_QUEUE_BUFFERING_MAX_MESSAGES, 10) || 100000, // NOTE: queue.buffering.max.messages >= batch.num.messages. Else, queue full error!
        "batch.num.messages": parseInt(env.VI_KAFKA_SINK_BATCH_NUM_MESSAGES, 10) || 10000,
        dr_cb: true, // message does not appear in delivery report
        "statistics.interval.ms": 0,
        "log.connection.close": false,
        "max.in.flight.requests.per.connection": parseInt(env.VI_KAFKA_SINK_MAX_REQUESTS_PER_CONNECTION, 10) || 3
      },
      topicConfig: {
        "request.required.acks": parseInt(env.VI_KAFKA_SINK_REQUEST_REQUIRED_ACKS, 10) || 1
      },
      retryConfig: {
        maxRetryAttempts: parseInt(env.VI_KAFKA_SINK_MAX_RETRY_ATTEMPTS, 10) || 0, // 0 retries within vi-kafka-stream-client
        scalingDuration: parseInt(env.VI_KAFKA_SINK_SCALING_DURATION, 10) || 1,
        timeout: parseInt(env.VI_KAFKA_SINK_RETRY_TIMEOUT, 10) || 2000
      },
      errorConfig: {
        ignorableErrors: [
          {code: -195, message: "broker transport failure"},
          {code: -1, message: "broker transport failure"},
          {code: -1, message: "all broker connections are down"},
          {code: -1, message: "timed out"}
        ]
      }
    },
    deliveryReportPollInterval: parseInt(env.VI_KAFKA_SINK_DELIVERY_REPORT_POLL_INTERVAL, 10) || 5000,
    flushTimeout: Number.parseInt(env.VI_FLUSH_TIMEOUT, 10) || 5000
  }

  log.info({appConfig: JSON.stringify(config, null, 2)}, "Kafka producer config")

  const strategies = {
    MTConnectDataItems: {
      topics: config.dataTopics,
      getMessageKey: e => e.device_uuid
    },
    [ACK_MSG_TAG]: {
      topics: []
    }
  }

  const hasTag = event => {
    if (!R.has("tag", event)) {
      log.error({ctx: {event: JSON.stringify(event, null, 2)}}, "Event does not contain tag")
      return false
    }
    return true
  }

  const flushAndThrow = producer => err => {
    const flushObs = bindNodeCallback(producer.flush.bind(producer))
    return flushObs(config.flushTimeout).pipe(flatMap(() => throwError(err)))
  }

  const send = producer => event => {
    const {topics, getMessageKey} = strategies[event.tag]

    if (topics.length === 0) {
      return of(event)
    }

    if (event.tag === ACK_MSG_TAG) {
      return of(event)
    }

    const key = (getMessageKey && getMessageKey(event)) || null
    const observables = topics.map(
      topic =>
        new Observable(observer => {
          producer.produce(topic, null, Buffer.from(event), key, Date.now(), error => {
            if (!error) {
              observer.next(event)
              const {channel, device_uuid, data_item_name} = event // eslint-disable-line
              metricRegistry.updateStat("Counter", "num_messages_sent", 1, {channel, device_uuid, data_item_name})
              observer.complete()
            } else {
              log.error(
                {error: errorFormatter(error)},
                `Kafka sink: Got error while sending message to kafka: ${error.message}`
              )
              observer.error({...error, kafka_topic: topic})
            }
          })
        })
    )

    return merge(...observables)
  }

  const {globalConfig, topicConfig, retryConfig, errorConfig} = config["vi-kafka-stream-client-options"]

  const catchAndAttachErrorCodes = err => {
    const {
      ERR__TRANSPORT,
      ERR__ALL_BROKERS_DOWN,
      ERR__TIMED_OUT,
      ERR_REQUEST_TIMED_OUT,
      ERR_BROKER_NOT_AVAILABLE
    } = kafkaErrorCodes
    if (
      [ERR__TRANSPORT, ERR__ALL_BROKERS_DOWN, ERR__TIMED_OUT, ERR_REQUEST_TIMED_OUT, ERR_BROKER_NOT_AVAILABLE].includes(
        err.code
      ) ||
      /all broker connections are down/.test(err.message) || // Should have error code ERR__ALL_BROKERS_DOWN, but has error code ERR_UNKNOWN in some cases
      /Message timed out/.test(err.message) || // Should have error code ERR__TIMED_OUT, but has error code ERR_UNKNOWN in some cases
      /broker transport failure/.test(err.message) // Should have error code ERR__TRANSPORT, but has error code ERR_UNKNOWN in some cases
    ) {
      err.errorCode = "WRITER_DISCONNECTED" // eslint-disable-line no-param-reassign
    }

    return throwError(err)
  }

  return stream =>
    Producer(globalConfig, topicConfig)
      .producer$({retryConfig, log, errorConfig}) // producer throws after 30 seconds if unable to connect
      .pipe(
        switchMap(producer => {
          producer.setPollInterval(config.deliveryReportPollInterval)

          return stream.pipe(
            filter(hasTag),
            bufferTime(config.bufferTimeSpan),
            filter(R.complement(R.isEmpty)),
            concatMap(events => forkJoin(R.map(send(producer), events))),
            concatAll(),
            catchError(flushAndThrow(producer)),
            finalize(() => {
              log.warn("Disconnecting producer")
              producer.disconnect()
            })
          )
        }),
        catchError(catchAndAttachErrorCodes)
      )
}
