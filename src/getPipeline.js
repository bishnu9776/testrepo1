import {concatMap, filter, groupBy, map, mergeMap, tap} from "rxjs/operators"
import {from} from "rxjs"
import {equals, intersection, path} from "ramda"
import {getGCPstream} from "./gcpSubscriber"
import {log} from "./logger"
import {formatData} from "./formatData/formatData"
import {kafkaProducer} from "./kafkaProducer"
import {retryWithExponentialBackoff} from "./utils/retryWithExponentialBackoff"
import {ACK_MSG_TAG} from "./constants"
import probe from "./probe"

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
//  1. Have a whitelist of keys to send out
//  2. Data loss metrics.
//  3. How to use seq_num and global_seq_num?
//  4. Clean up parsers. Go through comments in individual parsers, and their spec
//  5. Do merge probe info and using correct value key outside of all the parsers

const stateStore = {}
const requiredKeys = ["data_item_name", "data_item_id", "timestamp", "device_uuid"]
const valueKeys = ["value", "value_event", "value_sample", "value_location", "value_xyz"]

export const getPipeline = ({metricRegistry}) => {
  const {acknowledgeMessage, stream} = initializeGCPStream(metricRegistry)

  return stream.pipe(
    mergeMap(event => from(formatData({log, metricRegistry, probe})(event))),
    filter(x => !!x),
    concatMap(events => from(events)),
    filter(event => {
      const eventKeys = Object.keys(event)
      const hasRequiredKeys = requiredKeys.reduce((acc, x) => eventKeys.includes(x) && acc, true)
      const hasValueKey = valueKeys.reduce((acc, x) => eventKeys.includes(x) || acc, false)
      if (hasRequiredKeys && hasValueKey) {
        return true
      }

      if (event.tag === ACK_MSG_TAG) {
        return true
      }

      log.warn({ctx: {rawEvent: JSON.stringify(event, null, 2)}}, "Event does not contain required keys")
      return false
    }),
    map(event => {
      const {device_uuid, data_item_name, timestamp} = event // eslint-disable-line
      return {tag: "MTConnectDataItems", ...event, id: `${device_uuid}-${data_item_name}-${timestamp}`} // eslint-disable-line
    }),
    groupBy(event => `${event.device_uuid}.${event.data_item_name}`),
    mergeMap(dataItemStream => {
      return dataItemStream.pipe(
        map(currentEvent => {
          const {channel, device_uuid, data_item_name} = currentEvent // eslint-disable-line
          metricRegistry.updateStat("Counter", "num_messages_before_dedup", 1, {channel, device_uuid, data_item_name})
          const valueKey = intersection(Object.keys(currentEvent), valueKeys)[0]

          const eventKey = `${currentEvent.device_uuid}-${currentEvent.data_item_name}`
          const previousEvent = stateStore[eventKey]
          stateStore[eventKey] = currentEvent

          const isDuplicateEvent =
            previousEvent &&
            currentEvent.timestamp >= previousEvent.timestamp &&
            equals(currentEvent[valueKey], previousEvent[valueKey])

          return isDuplicateEvent ? null : currentEvent
        })
      )
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
