import R from "ramda"
import {bindNodeCallback, forkJoin, merge, Observable, of, throwError} from "rxjs"
import {bufferTime, catchError, concatAll, concatMap, filter, finalize, flatMap, switchMap} from "rxjs/operators"
import {ErrorCodes as kafkaErrorCodes, Producer as KafkaProducer} from "vi-kafka-stream-client"

const {env} = process
const DefaultProducer = (globalConfig, topicConfig) => new KafkaProducer(globalConfig, topicConfig)

export const kafkaProducer = ({log, Producer = DefaultProducer}) => {
  const config = {
    dataTopics: ["test-topic-ather"],
    probeTopics: ["ather-probes"],
    bufferTimeSpan: Number.parseInt(env.VI_PRODUCER_BUFFER_TIME_SPAN, 10) || 5000,
    "vi-kafka-stream-client-options": {
      globalConfig: {
        "metadata.broker.list": env.VI_KAFKA_BROKER || "localhost:9092",
        "client.id": env.VI_KAFKA_SINK_CLIENT_ID || `ather-test`,
        "retry.backoff.ms": parseInt(env.VI_KAFKA_SINK_RETRY_BACKOFF_MS, 10) || 500,
        "message.send.max.retries": parseInt(env.VI_KAFKA_SINK_MESSAGE_SEND_MAX_RETRIES, 10) || 10, // retry for 5 mins
        "queue.buffering.max.ms": parseInt(env.VI_KAFKA_SINK_QUEUE_BUFFERING_MAX_MS, 10) || 500,
        "queue.buffering.max.messages": parseInt(env.VI_KAFKA_SINK_QUEUE_BUFFERING_MAX_MESSAGES, 10) || 100000, // NOTE: queue.buffering.max.messages >= batch.num.messages. Else, queue full error!
        "batch.num.messages": parseInt(env.VI_KAFKA_SINK_BATCH_NUM_MESSAGES, 10) || 10000,
        dr_cb: true, // message does not appear in delivery report
        "statistics.interval.ms": parseInt(env.VI_KAFKA_SINK_STATISTICS_INTERVAL_MS, 10) || 0, // TODO: Why do we need this?
        "log.connection.close": false,
        "max.in.flight.requests.per.connection": 1 // TODO: Can this be more than 1?
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
        ignorableErrors: [{code: -1, message: "all broker connections are down"}]
      }
    },
    deliveryReportPollInterval: parseInt(env.VI_KAFKA_SINK_DELIVERY_REPORT_POLL_INTERVAL, 10) || 5000,
    flushTimeout: Number.parseInt(env.VI_FLUSH_TIMEOUT, 10) || 5000
  }

  log.info({appConfig: JSON.stringify(config, null, 2)}, "Collector kafka producer config")

  const strategies = {
    MTConnectDevices: {
      topics: config.probeTopics,
      getMessageKey: probe => `MTConnectDevices-${probe.agent}-${probe.device_uuid}`
    },
    MTConnectDataItems: {
      topics: config.dataTopics,
      getMessageKey: event => `${event.device_uuid}`
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
    log.error(`Kafka sink: Got error while sending message to kafka: ${err.message}`)
    const flushObs = bindNodeCallback(producer.flush.bind(producer))
    return flushObs(config.flushTimeout).pipe(flatMap(() => throwError(err)))
  }

  const send = producer => event => {
    const {topics, getMessageKey} = strategies[event.tag]

    if (topics.length === 0) {
      return of(event)
    }

    // strip meta from event

    const value = JSON.stringify(event)
    const key = (getMessageKey && getMessageKey(event)) || null
    const observables = topics.map(
      topic =>
        new Observable(observer => {
          // send only non-ack events

          producer.produce(topic, null, Buffer.from(value), key, Date.now(), err => {
            if (!err) {
              observer.next(event)
              observer.complete()
            } else {
              observer.error({...err, kafka_topic: topic})
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
      .producer$({retryConfig, log, errorConfig})
      .pipe(
        switchMap(producer => {
          producer.setPollInterval(config.deliveryReportPollInterval)

          return stream.pipe(
            filter(hasTag),
            bufferTime(config.bufferTimeSpan),
            filter(R.complement(R.isEmpty)),
            concatMap(events => forkJoin(R.map(send(producer), events))),
            concatAll(),
            // ack message here
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
