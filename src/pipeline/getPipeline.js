import {concatMap, filter, map, mergeMap, tap, timeout} from "rxjs/operators"
import {from} from "rxjs"
import {complement, isEmpty} from "ramda"
import * as gcpSubscriber from "../gcpSubscriber/gcpStream"
import {getMessageParser} from "../messageParser"
import {getKafkaSender} from "../kafkaProducer"
import {retryWithExponentialBackoff} from "../utils/retryWithExponentialBackoff"
import {ACK_MSG_TAG} from "../constants"
import {getEventFormatter, isValid} from "../utils/helpers"
import {collectSubscriptionStats} from "../metrics/subscriptionStats"
import {errorFormatter} from "../utils/errorFormatter"
import {delayAndExit} from "../utils/delayAndExit"
import {loadProbe} from "./loadProbe"
import {endSpan, endTransaction, startSpan, startTransaction} from "../apm"

const {env} = process
const eventTimeout = process.env.VI_EVENT_TIMEOUT || 600000
const kafkaDelaySpanName = "kafka-delay"

const getPipelineRetryConfig = () => ({
  retryDelayCap: parseInt(env.VI_COLLECTOR_PIPELINE_RETRY_DELAY_CAP_MS, 10) || 30000,
  retryDelayFactor: parseInt(env.VI_COLLECTOR_PIPELINE_RETRY_DELAY_FACTOR, 10) || 2,
  retryDelayInit: parseInt(env.VI_COLLECTOR_PIPELINE_RETRY_DELAY_INIT_MS, 10) || 5000,
  maxRetryAttempts: parseInt(env.VI_COLLECTOR_PIPELINE_MAX_RETRY_ATTEMPTS, 10) || 5
})

const defaultObserver = log => ({
  complete: () => {
    log.error("GCP stream completed. Exiting application")
    delayAndExit(4)
  },
  error: error => {
    log.error({error: errorFormatter(error)}, "Error on pipeline stream. Exiting application")
    delayAndExit(5)
  }
})

export const getPipeline = ({log, observer, metricRegistry, probePath, subscriptionConfig, kafkaProducer}) => {
  const probe = loadProbe(probePath, log)
  const {subscriptionName, projectId, credentialsPath} = subscriptionConfig

  const {acknowledgeMessage, stream} = gcpSubscriber.getGCPStream({
    subscriptionName,
    projectId,
    credentialsPath,
    metricRegistry,
    log
  })

  const {statsInterval} = metricRegistry
  if (statsInterval) {
    collectSubscriptionStats({metricRegistry, subscriptionName, projectId, credentialsPath, statsInterval, log})
  }

  const sendToKafka = getKafkaSender({kafkaProducer, log, metricRegistry})
  const parseMessage = getMessageParser({log, metricRegistry, probe})
  const formatEvent = getEventFormatter()

  let messageCounter = 0

  const apmSamplingFrequency = parseInt(process.env.VI_APM_SAMPLING_FREQUENCY || "0", 10) // once every so many messages, create a transaction

  const shouldSampleMessage = () => {
    messageCounter += 1
    if ((messageCounter % apmSamplingFrequency === 0 || messageCounter === 1) && apmSamplingFrequency !== 0) {
      return true
    }
    return false
  }

  return stream
    .pipe(
      timeout(eventTimeout),
      tap(message => {
        if (shouldSampleMessage()) {
          startTransaction(message)
        }
      }),
      tap(message => {
        startSpan({message, spanName: "parsing", spanType: "parsing"})
      }),
      mergeMap(event => from(parseMessage(event))),
      filter(complement(isEmpty)),
      concatMap(events => from(events)), // previous from returns a promise which resolves to an array
      tap(event => {
        if (event.tag === ACK_MSG_TAG) {
          endSpan({message: event.message, spanName: "parsing"})
        }
      }),
      filter(isValid), // After finalising all parsers, remove this.
      map(formatEvent),
      tap(event => {
        if (event.tag === ACK_MSG_TAG) {
          startSpan({message: event.message, spanName: kafkaDelaySpanName, spanType: kafkaDelaySpanName})
        }
      }),
      // start span of sending to kafka
      sendToKafka,
      tap(event => {
        if (event.tag === ACK_MSG_TAG) {
          endSpan({message: event.message, spanName: kafkaDelaySpanName})
          endTransaction(event.message)
          acknowledgeMessage(event.message)
        }
      }),
      retryWithExponentialBackoff({
        ...getPipelineRetryConfig(),
        log
      })
    )
    .subscribe(observer || defaultObserver(log))
}
