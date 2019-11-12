import {concatMap, filter, map, mergeMap, tap, timeout} from "rxjs/operators"
import {from} from "rxjs"
import * as gcpSubscriber from "./gcpSubscriber"
import {formatData} from "./formatData/formatData"
import * as kafkaProducer from "./kafkaProducer"
import {retryWithExponentialBackoff} from "./utils/retryWithExponentialBackoff"
import {ACK_MSG_TAG} from "./constants"
import {formatEvent, isValid} from "./utils/helpers"
import {collectSubscriptionStats} from "./metrics/subscriptionStats"
import {collectProcessStats} from "./metrics/processStats"
import {errorFormatter} from "./utils/errorFormatter"
import {delayAndExit} from "./utils/delayAndExit"
import {getMetricRegistry} from "./metrics/metricRegistry"

const {env} = process
const subscriptionName = env.VI_GCP_PUBSUB_SUBSCRIPTION
const projectId = env.VI_GCP_PROJECT_ID
const credentialsPath = env.VI_GCP_SERVICE_ACCOUNT_CREDS_FILE_PATH
const eventTimeout = process.env.VI_EVENT_TIMEOUT || 600000

export const getPipeline = ({log, observer}) => {
  let probe
  try {
    probe = require(process.env.VI_COLLECTOR_PROBE_PATH) // eslint-disable-line
  } catch (e) {
    log.error({error: errorFormatter(e)}, "Could not load probe. Exiting process")
    delayAndExit(3)
  }

  const metricRegistry = getMetricRegistry(log)
  const {acknowledgeMessage, stream} = gcpSubscriber.getGCPStream({
    subscriptionName,
    projectId,
    credentialsPath,
    metricRegistry,
    log
  })

  metricRegistry.startStatsReporting()
  const {statsInterval} = metricRegistry
  if (statsInterval) {
    collectSubscriptionStats({metricRegistry, subscriptionName, projectId, credentialsPath, statsInterval})
    collectProcessStats({metricRegistry, statsInterval})
  }

  const defaultObserver = {
    complete: () => {
      log.error("GCP stream completed. Exiting application")
      delayAndExit(4)
    },
    error: error => {
      log.error({error: errorFormatter(error)}, "Error on pipeline stream. Exiting application")
      delayAndExit(5)
    }
  }

  return stream
    .pipe(
      timeout(eventTimeout),
      mergeMap(event => from(formatData({log, metricRegistry, probe})(event))),
      filter(x => !!x),
      concatMap(events => from(events)),
      filter(isValid), // After finalising all parsers, remove this.
      map(formatEvent),
      filter(x => !!x),
      kafkaProducer.getKafkaProducer({log, metricRegistry}),
      tap(event => {
        if (event.tag === ACK_MSG_TAG) {
          acknowledgeMessage(event.message)
        }
      }),
      retryWithExponentialBackoff({retryDelayCap: 30000, retryDelayFactor: 2, retryDelayInit: 5000, log})
    )
    .subscribe(observer || defaultObserver)
}
