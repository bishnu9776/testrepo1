import {log} from "./logger"
import {getMetricRegistry} from "./metricRegistry"
import {getPipeline} from "./getPipeline"

const metricRegistry = getMetricRegistry(log)
metricRegistry.startStatsReporting()
const pipeline = getPipeline({metricRegistry})

pipeline.subscribe({
  complete: () => {
    log.warn("GCP stream completed. Exiting application")
    process.exit(0)
  }
})

const delayAndExit = (exitCode, delayMs = 5000) => {
  setTimeout(() => {
    process.exit(exitCode)
  }, delayMs)
}

const sigExit = signal => {
  if (pipeline) {
    pipeline.unsubscribe()
  }
  log.info(`Exiting due to ${signal}`)
  delayAndExit(0)
}

process.on("SIGINT", () => sigExit("SIGINT"))
process.on("SIGTERM", () => sigExit("SIGTERM"))
process.on("uncaughtException", error => {
  const errorMsg = error.message || error
  log.error({uncaughtError: JSON.stringify(error)}, "Uncaught exception: ", JSON.stringify(errorMsg))
  pipeline.unsubscribe()
  delayAndExit(0)
})

// Stats
// 1. Consumption lag from GCP
// 2. Events consumed from GCP
// 3. Events written to Kafka

// info logs
// 1. Connection to GCP
// 2. Connection to Kafka
// 3. Retry logs

// error logs
// ..
