import {concatMap, filter, map, mergeMap, tap, timeout} from "rxjs/operators"
import {from} from "rxjs"
import {omit, path} from "ramda"
import * as gcpSubscriber from "./gcpSubscriber"
import {formatData} from "./formatData/formatData"
import * as kafkaProducer from "./kafkaProducer"
import {retryWithExponentialBackoff} from "./utils/retryWithExponentialBackoff"
import {ACK_MSG_TAG} from "./constants"

const {env} = process
const subscriptionName = env.VI_GCP_PUBSUB_SUBSCRIPTION
const projectId = env.VI_GCP_PROJECT_ID
const credentialsPath = env.VI_GCP_SERVICE_ACCOUNT_CREDS_FILE_PATH
const eventTimeout = process.env.VI_EVENT_TIMEOUT || 600000

// TODO:
//  1. Handle disk full exception in Kafka (currently silently dies)

const requiredKeys = ["data_item_name", "data_item_id", "timestamp", "device_uuid", "sequence"]

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
    // TODO: Remove this after writing unit tests for parsers to include all the necessary keys
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
      /* eslint-disable camelcase */
      const {device_uuid, data_item_name, timestamp, bigsink_timestamp} = event
      const id = `${device_uuid}-${data_item_name}-${timestamp}`
      const collector_received_at = new Date()
      const collector_latency = collector_received_at - new Date(bigsink_timestamp)

      return {
        tag: "MTConnectDataItems",
        ...omit(["bigsink_timestamp"], event),
        agent: "ather",
        id,
        instance_id: id,
        meta: {collector_received_at: collector_received_at.toISOString(), collector_latency, bigsink_timestamp}
      }
      /* eslint-disable camelcase */
    }),
    filter(x => !!x),
    kafkaProducer.getKafkaProducer({log, metricRegistry}),
    tap(event => {
      if (event.tag === ACK_MSG_TAG) {
        const eventPublishTime = event.message.publishTime.getTime()
        const consumerLag = event.message.received - eventPublishTime

        metricRegistry.updateStat("Gauge", "consumerLag", consumerLag, {
          device_uuid: path(["message", "attributes", "bike_id"], event)
        })

        acknowledgeMessage(event.message)
      }
    }),
    retryWithExponentialBackoff({retryDelayCap: 30000, retryDelayFactor: 2, retryDelayInit: 5000, log})
  )
}
