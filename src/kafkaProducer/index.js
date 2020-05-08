import {bindNodeCallback, forkJoin, throwError, of, Observable, merge} from "rxjs"
import {bufferTime, catchError, concatAll, concatMap, filter, flatMap} from "rxjs/operators"
import {complement, isEmpty, has} from "ramda"
import {errorFormatter} from "../utils/errorFormatter"
import {getMessageKey, getRoutingConfig, getTopics} from "./routingUtils"
import {ACK_MSG_TAG} from "../constants"
import {getEventTags} from "../metrics/tags"

const {env} = process

const hasTag = log => event => {
  if (!has("tag", event)) {
    log.error({ctx: {event: JSON.stringify(event, null, 2)}}, "Event does not contain tag")
    return false
  }
  return true
}

// TODO: Do we even need this?
const flushAndThrow = ({kafkaProducer, log}) => err => {
  const flushTimeout = parseInt(env.VI_FLUSH_TIMEOUT, 10) || 5000

  try {
    const flushObs = bindNodeCallback(kafkaProducer.flush.bind(kafkaProducer))
    return flushObs(flushTimeout).pipe(flatMap(() => throwError(err)))
  } catch (error) {
    log.warn({error: errorFormatter(error)}, "Error while flushing kafka producer queue")
    return throwError(err)
  }
}

// TODO: Rename this function
const getObservables = ({event, topics, kafkaProducer, metricRegistry, log}) => {
  const key = getMessageKey(event)

  return topics.map(
    topic =>
      new Observable(observer => {
        kafkaProducer.produce(topic, null, Buffer.from(JSON.stringify(event)), key, Date.now(), error => {
          if (!error) {
            observer.next(event)
            metricRegistry.updateStat("Counter", "num_messages_sent", 1, {...getEventTags(event), topic})
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
}

const createProduceRequests = ({kafkaProducer, routingConfig, metricRegistry, log}) => event => {
  const topics = getTopics(event, routingConfig)
  const shouldNotSendEvent = topics.length === 0 || event.tag === ACK_MSG_TAG
  if (shouldNotSendEvent) {
    return of(event)
  }

  return merge(...getObservables({kafkaProducer, event, topics, metricRegistry, log}))
}

export const getKafkaSender = ({kafkaProducer, log, metricRegistry}) => {
  const routingConfig = getRoutingConfig()
  const createProduceRequestsForEvent = createProduceRequests({kafkaProducer, routingConfig, metricRegistry, log})
  const bufferTimeSpan = parseInt(env.VI_PRODUCER_BUFFER_TIME_SPAN, 10) || 5000

  return stream =>
    stream.pipe(
      filter(hasTag(log)),
      bufferTime(bufferTimeSpan),
      filter(complement(isEmpty)),
      concatMap(events => forkJoin(events.map(createProduceRequestsForEvent))),
      concatAll(),
      catchError(flushAndThrow({kafkaProducer, log}))
    )
}
