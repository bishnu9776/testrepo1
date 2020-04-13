import {createProducer} from "node-microservice/dist/kafka/producer/create-producer"
import {log} from "../logger"
import {getPipeline} from "./getPipeline"
import {getMetricRegistry} from "../metrics/metricRegistry"
import {collectProcessStats} from "../metrics/processStats"

const {env} = process

const pipelines = []

const getSubscriptionsWithProbeMapping = () => {
  const subscriptionToProbeMapping = {}
  if (env.VI_GCP_PUBSUB_BIKE_SUBSCRIPTION) {
    subscriptionToProbeMapping[env.VI_GCP_PUBSUB_BIKE_SUBSCRIPTION] = env.VI_COLLECTOR_BIKE_PROBE_PATH
  }

  if (env.VI_GCP_PUBSUB_GRID_SUBSCRIPTION) {
    subscriptionToProbeMapping[env.VI_GCP_PUBSUB_GRID_SUBSCRIPTION] = env.VI_COLLECTOR_GRID_PROBE_PATH
  }

  return subscriptionToProbeMapping
}

export const startPipelines = async () => {
  const kafkaProps = {
    parentLog: log
  }
  const kafkaProducer = await createProducer(kafkaProps)
  const metricRegistry = getMetricRegistry(log)

  metricRegistry.startStatsReporting()
  collectProcessStats(metricRegistry)

  const subscriptionsWithProbeMapping = getSubscriptionsWithProbeMapping()

  Object.keys(subscriptionsWithProbeMapping).forEach(gcpSubscription => {
    const subscriptionConfig = {
      subscriptionName: gcpSubscription,
      projectId: env.VI_GCP_PROJECT_ID,
      credentialsPath: env.VI_GCP_SERVICE_ACCOUNT_CREDS_FILE_PATH
    }

    pipelines.push(
      getPipeline({
        subscriptionConfig,
        log,
        metricRegistry,
        probePath: subscriptionsWithProbeMapping[gcpSubscription],
        kafkaProducer
      })
    )
  })
}

export const stopPipelines = () => {
  pipelines.forEach(pipeline => {
    if (pipeline && pipeline.unsubscribe) {
      pipeline.unsubscribe()
    }
  })
}
