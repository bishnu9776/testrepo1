import {getGCPStream} from "./gcp/gcpStream"
import {collectSubscriptionStats} from "../metrics/subscriptionStats"

export const getSourceStream = ({log, metricRegistry}) => {
  const {env} = process
  const subscriptionConfig = {
    subscriptionName: env.VI_GCP_PUBSUB_BIKE_SUBSCRIPTION,
    projectId: env.VI_GCP_PROJECT_ID,
    credentialsPath: env.VI_GCP_SERVICE_ACCOUNT_CREDS_FILE_PATH
  }

  const {statsInterval} = metricRegistry
  if (statsInterval) {
    collectSubscriptionStats({metricRegistry, ...subscriptionConfig, statsInterval, log})
  }
  const {acknowledgeMessage, stream} = getGCPStream({
    ...subscriptionConfig,
    metricRegistry,
    log
  })

  return {acknowledgeMessage, stream}
}
