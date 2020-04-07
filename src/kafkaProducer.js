import R from "ramda"
import {bindNodeCallback, forkJoin, merge, Observable, of, throwError} from "rxjs"
import {bufferTime, catchError, concatAll, concatMap, filter, finalize, flatMap, switchMap} from "rxjs/operators"
import {Producer as KafkaProducer} from "vi-kafka-stream-client"
import {ACK_MSG_TAG} from "./constants"
import {errorFormatter} from "./utils/errorFormatter"

// TODO: Refactor this. Can we use node-ms kafka producer?
const {env} = process
const DefaultProducer = (globalConfig, topicConfig) => new KafkaProducer(globalConfig, topicConfig)
const debugStats = JSON.parse(process.env.VI_STATS_PER_DEVICE || "false")
const getGlobalConfig = () => ({
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
})

const getConfig = () => ({
  dataTopics: env.VI_KAFKA_SINK_DATA_TOPICS ? env.VI_KAFKA_SINK_DATA_TOPICS.split(",") : ["test-topic-ather"],
  archiveTopics: env.VI_KAFKA_SINK_ARCHIVE_TOPICS
    ? env.VI_KAFKA_SINK_ARCHIVE_TOPICS.split(",")
    : ["test-archive-topic-ather"],
  whitetlist: env.VI_DATAITEM_WHITELIST ? env.VI_DATAITEM_WHITELIST.split(",") : [],
  bufferTimeSpan: Number.parseInt(env.VI_PRODUCER_BUFFER_TIME_SPAN, 10) || 5000,
  "vi-kafka-stream-client-options": {
    globalConfig: getGlobalConfig(),
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
        {code: -1, message: "timed out"}
      ]
    }
  },
  deliveryReportPollInterval: parseInt(env.VI_KAFKA_SINK_DELIVERY_REPORT_POLL_INTERVAL, 10) || 5000,
  flushTimeout: Number.parseInt(env.VI_FLUSH_TIMEOUT, 10) || 5000
})
const getRoutes = config => [
  {
    filter: e => config.whitetlist.includes(e.data_item_name),
    topics: config.dataTopics
  },
  {
    filter: e => e.tag === "MTConnectDataItems",
    topics: config.archiveTopics
  }
]

const getTopics = (event, routes) =>
  routes.reduce((acc, route) => {
    if (route.filter(event)) {
      return [...acc, ...route.topics]
    }
    return acc
  }, [])

const getTags = ({channel, deviceUuid, topic}) =>
  debugStats
    ? {
        channel,
        device_uuid: deviceUuid,
        kafka_topic: topic
      }
    : {channel, kafka_topic: topic}

export const getKafkaProducer = ({log, Producer = DefaultProducer, metricRegistry}) => {
  const config = getConfig()
  log.info({appConfig: JSON.stringify(config, null, 2)}, "Kafka producer config")
  const hasTag = event => {
    if (!R.has("tag", event)) {
      log.error({ctx: {event: JSON.stringify(event, null, 2)}}, "Event does not contain tag")
      return false
    }
    return true
  }

  const flushAndThrow = producer => err => {
    try {
      const flushObs = bindNodeCallback(producer.flush.bind(producer))
      return flushObs(config.flushTimeout).pipe(flatMap(() => throwError(err)))
    } catch (error) {
      log.warn({error: errorFormatter(error)}, "Error while flushing kafka producer queue")
      return throwError(err)
    }
  }

  const send = producer => event => {
    const routes = getRoutes(config)
    const topics = getTopics(event, routes)
    const getMessageKey = e => e.device_uuid || null

    if (topics.length === 0 || event.tag === ACK_MSG_TAG) {
      return of(event)
    }

    const key = (getMessageKey && getMessageKey(event)) || null
    const observables = topics.map(
      topic =>
        new Observable(observer => {
          producer.produce(topic, null, Buffer.from(JSON.stringify(event)), key, Date.now(), error => {
            if (!error) {
              observer.next(event)
              const {channel, device_uuid} = event // eslint-disable-line
              const tags = getTags({channel, deviceUuid: device_uuid, topic})
              metricRegistry.updateStat("Counter", "num_messages_sent", 1, tags)
              observer.complete()
            } else {
              log.error(
                {error: errorFormatter(error)},
                `Kafka sink: Got error while sending message to kafka: ${error.message}`
              )
              observer.error({message: error.message, kafka_topic: topic})
            }
          })
        })
    )

    return merge(...observables)
  }

  const {globalConfig, topicConfig, retryConfig, errorConfig} = config["vi-kafka-stream-client-options"]

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
              log.warn("Disconnecting kafka producer")
              producer.disconnect()
            })
          )
        })
      )
}
