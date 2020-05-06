import {concatMap, filter, map, mergeMap, tap, timeout} from "rxjs/operators"
import fs from "fs"
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

const {env} = process
const eventTimeout = process.env.VI_EVENT_TIMEOUT || 600000

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

  return stream
    .pipe(
      timeout(eventTimeout),
      // filter(x => !x.attributes.subFolder.includes("v1")),
      // tap(x => {
      //   try {
      //     fs.writeFileSync(
      //       "/Users/subramanyam/work/svc-ather-collector/avro_mock",
      //       JSON.stringify({data: x.data, attributes: x.attributes})
      //     )
      //     console.log("wrote to file")
      //   } catch (e) {
      //     console.log(e)
      //   } finally {
      //     console.log(x)
      //   }
      // }),
      mergeMap(event => from(parseMessage(event))),
      filter(complement(isEmpty)),
      concatMap(events => from(events)), // previous from returns a promise which resolves to an array
      filter(isValid), // After finalising all parsers, remove this.
      map(formatEvent),
      sendToKafka,
      tap(event => {
        if (event.tag === ACK_MSG_TAG) {
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
