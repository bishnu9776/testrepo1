import {concatMap, filter, map, mergeMap, tap} from "rxjs/operators"
import {flatten} from "ramda"
import {from} from "rxjs"
import {getGCPstream} from "./gcpSubscriber"
import {log} from "./logger"
import {formatData} from "./formatData/formatData"
import {kafkaProducer} from "./kafkaProducer"
import {retryWithExponentialBackoff} from "./utils/retryWithExponentialBackoff"
import {ACK_MSG_TAG} from "./constants"

const {env} = process
const subscriptionName = env.VI_GCP_PUBSUB_SUBSCRIPTION
const projectId = env.VI_GCP_PROJECT_ID
const credentialsPath = env.VI_GCP_SERVICE_ACCOUNT_CREDS_FILE_PATH

const initializeGCPStream = metricRegistry =>
  getGCPstream({
    subscriptionName,
    projectId,
    credentialsPath,
    metricRegistry,
    log
  })

const probe = {}

// TODO:
//  1. Read from file and pass to formatData. Exit application if probe not available
//  2. Have a whitelist of keys to send out
//  3. Data loss metrics
//  4. Group by bike x data_item_id and do distinctUntilChanged before sending to Kafka

export const getPipeline = ({metricRegistry}) => {
  const {acknowledgeMessage, stream} = initializeGCPStream(metricRegistry)

  return stream.pipe(
    mergeMap(event => from(formatData({log, metricRegistry, probe})(event))),
    filter(x => !!x),
    map(x => flatten([x])),
    concatMap(events => from(events)),
    kafkaProducer({log, metricRegistry}),
    tap(event => {
      if (event.tag === ACK_MSG_TAG) {
        const eventPublishTime = event.message.publishTime.getTime()
        const consumerLag = event.message.received - eventPublishTime

        metricRegistry.updateStat("Gauge", "lastAckedMessagePublishTime", eventPublishTime, {
          device_uuid: "ather" // TODO Update tag
        })
        metricRegistry.updateStat("Gauge", "consumerLag", consumerLag, {
          device_uuid: "ather" // TODO Update tag
        })

        acknowledgeMessage(event.message)
      }
    }),
    retryWithExponentialBackoff({retryDelayCap: 30000, retryDelayFactor: 2, retryDelayInit: 5000, log})
  )
}
