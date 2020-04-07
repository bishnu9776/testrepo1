import {concatMap, filter, map, mergeMap, tap, timeout} from "rxjs/operators"
import {from} from "rxjs"
import * as gcpSubscriber from "../gcpSubscriber/gcpStream"
import {parseGCPMessage} from "../gcpMessageParser/parseGCPMessage"
import * as kafkaProducer from "../kafkaProducer"
import {retryWithExponentialBackoff} from "../utils/retryWithExponentialBackoff"
import {ACK_MSG_TAG} from "../constants"
import {addSchemaVersion, isValid} from "../utils/helpers"
import {collectSubscriptionStats} from "../metrics/subscriptionStats"
import {errorFormatter} from "../utils/errorFormatter"
import {delayAndExit} from "../utils/delayAndExit"

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

const getProbe = (filePath, log) => {
  try {
    const probe = require(filePath) // eslint-disable-line
    return probe
  } catch (e) {
    log.error({error: errorFormatter(e)}, "Could not load probe. Exiting process")
    delayAndExit(3)
  }
}

export const getPipeline = ({log, observer, metricRegistry, probePath, subscriptionConfig}) => {
  const probe = getProbe(probePath, log)
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

  return stream
    .pipe(
      timeout(eventTimeout),
      mergeMap(event => from(parseGCPMessage({log, metricRegistry, probe})(event))),
      filter(x => !!x),
      concatMap(events => from(events)),
      filter(isValid), // After finalising all parsers, remove this.
      map(addSchemaVersion()),
      filter(x => !!x),
      kafkaProducer.getKafkaProducer({log, metricRegistry}),
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
