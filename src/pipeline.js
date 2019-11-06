import {concatMap, filter, map, mergeMap, tap, timeout} from "rxjs/operators"
import {from} from "rxjs"
import * as gcpSubscriber from "./gcpSubscriber"
import {formatData} from "./formatData/formatData"
import * as kafkaProducer from "./kafkaProducer"
import {retryWithExponentialBackoff} from "./utils/retryWithExponentialBackoff"
import {ACK_MSG_TAG} from "./constants"
import {formatEvent, isValid} from "./utils/helpers"

const {env} = process
const subscriptionName = env.VI_GCP_PUBSUB_SUBSCRIPTION
const projectId = env.VI_GCP_PROJECT_ID
const credentialsPath = env.VI_GCP_SERVICE_ACCOUNT_CREDS_FILE_PATH
const eventTimeout = process.env.VI_EVENT_TIMEOUT || 600000

export const getPipeline = ({metricRegistry, probe, log}) => {
  const {acknowledgeMessage, stream} = gcpSubscriber.getGCPStream({
    subscriptionName,
    projectId,
    credentialsPath,
    metricRegistry,
    log
  })

  return stream.pipe(
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
}
