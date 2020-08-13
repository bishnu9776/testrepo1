import {collectSubscriptionStats} from "../../metrics/subscriptionStats"
import {getGCPStream} from "./gcpStream"

const gcp = appContext => {
  const {env} = process
  const subscriptionConfig = {
    subscriptionName: env.VI_GCP_PUBSUB_SUBSCRIPTION,
    projectId: env.VI_GCP_PROJECT_ID,
    credentialsPath: env.VI_GCP_SERVICE_ACCOUNT_CREDS_FILE_PATH
  }

  const {statsInterval} = appContext.metricRegistry
  if (statsInterval) {
    collectSubscriptionStats({...subscriptionConfig, statsInterval, appContext})
  }
  const {stream} = getGCPStream({
    ...subscriptionConfig,
    appContext
  })

  return {stream}
}

export default gcp
