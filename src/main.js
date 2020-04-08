import {handleSignals} from "node-microservice"
import {createProducer} from "node-microservice/dist/kafka/producer/create-producer"
import {log} from "./logger"
import {getPipeline} from "./pipeline"
import {errorFormatter} from "./utils/errorFormatter"
import appFactory from "./appFactory"
import {getMetricRegistry} from "./metrics/metricRegistry"
import {collectProcessStats} from "./metrics/processStats"

const {env} = process
const port = parseInt(process.env.VI_PORT || "3000", 10)

const subscriptionToProbeMapping = {
  bike: env.VI_COLLECTOR_BIKE_PROBE_PATH,
  grid: env.VI_COLLECTOR_GRID_PROBE_PATH
}

const pipelines = []

// TODO: Refactor this file
// TODO: Add spec for same
const startPipelines = async subscriptionNames => {
  const kafkaProps = {
    parentLog: log
  }
  const kafkaProducer = await createProducer(kafkaProps)
  const metricRegistry = getMetricRegistry(log)

  metricRegistry.startStatsReporting()
  collectProcessStats(metricRegistry)

  subscriptionNames.forEach(subscriptionName => {
    const subscriptionConfig = {
      subscriptionName,
      projectId: env.VI_GCP_PROJECT_ID,
      credentialsPath: env.VI_GCP_SERVICE_ACCOUNT_CREDS_FILE_PATH
    }

    pipelines.push(
      getPipeline({
        subscriptionConfig,
        log,
        metricRegistry,
        probePath: subscriptionToProbeMapping[subscriptionName],
        kafkaProducer
      })
    )
  })
}
const app = appFactory()

app.listen(port, () => {
  log.info({port}, "Starting Ather Collector")
  const subscriptionNames = env.VI_GCP_PUBSUB_SUBSCRIPTIONS.split(",")
  startPipelines(subscriptionNames)
})

const exitHandler = () => {
  pipelines.forEach(pipeline => {
    if (pipeline && pipeline.unsubscribe) {
      pipeline.unsubscribe()
    }
  })

  return Promise.resolve(null)
}

handleSignals(log, exitHandler)
process.on("unhandledRejection", error => {
  log.warn({error: errorFormatter(error)}, "Got unhandled promise rejection")
  // gcp throws UnhandledPromiseRejectionWarning when modifyAckDeadline fails
  // We do not want to exit the application unnecessarily. Instead, pipeline will resubscribe and continue.
})
