import {concatMap, filter, map, mergeMap, tap} from "rxjs/operators"
import {from} from "rxjs"
import {path} from "ramda"
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

// TODO:
//  1. Clean up parsers. Go through comments in individual parsers, and their spec
//  2. Do merge probe info and using correct value key outside of all the parsers
//  3. Handle disk full exception in Kafka (currently silently dies)
//  4. Do we need version and channel as top level keys?

const requiredKeys = ["data_item_name", "data_item_id", "timestamp", "device_uuid", "sequence"]

export const getPipeline = ({metricRegistry, probe}) => {
  const {acknowledgeMessage, stream} = initializeGCPStream(metricRegistry)

  return stream.pipe(
    mergeMap(event => from(formatData({log, metricRegistry, probe})(event))),
    filter(x => !!x),
    concatMap(events => from(events)),
    filter(event => {
      const eventKeys = Object.keys(event)
      const hasRequiredKeys = requiredKeys.reduce((acc, x) => eventKeys.includes(x) && acc, true)
      if (hasRequiredKeys || event.tag === ACK_MSG_TAG) {
        return true
      }

      log.warn({ctx: {rawEvent: JSON.stringify(event, null, 2)}}, "Event does not contain required keys")
      return false
    }),
    map(event => {
      const {device_uuid, data_item_name, timestamp} = event // eslint-disable-line
      const id = `${device_uuid}-${data_item_name}-${timestamp}` // eslint-disable-line
      return {tag: "MTConnectDataItems", ...event, agent: "ather", id, instance_id: id, received_at: new Date().toISOString()} // eslint-disable-line
    }),
    filter(x => !!x),
    kafkaProducer({log, metricRegistry}),
    tap(event => {
      if (event.tag === ACK_MSG_TAG) {
        const eventPublishTime = event.message.publishTime.getTime()
        const consumerLag = event.message.received - eventPublishTime

        metricRegistry.updateStat("Gauge", "lastAckedMessagePublishTime", eventPublishTime, {
          device_uuid: path(["message", "attributes", "bike_id"], event)
        })
        metricRegistry.updateStat("Gauge", "consumerLag", consumerLag, {
          device_uuid: path(["message", "attributes", "bike_id"], event)
        })

        acknowledgeMessage(event.message)
      }
    }),
    retryWithExponentialBackoff({retryDelayCap: 30000, retryDelayFactor: 2, retryDelayInit: 5000, log})
  )
}
