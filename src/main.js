import {timeout} from "rxjs/operators"
import {log} from "./logger"
import {getMetricRegistry} from "./metricRegistry"
import {getPipeline} from "./getPipeline"
import {errorFormatter} from "./utils/errorFormatter"

const metricRegistry = getMetricRegistry(log)
const pipeline = getPipeline({metricRegistry})
const eventTimeout = process.env.VI_EVENT_TIMEOUT || 600000

metricRegistry.startStatsReporting()

pipeline.pipe(timeout(eventTimeout)).subscribe({
  complete: () => {
    log.error("GCP stream completed. Exiting application")
    delayAndExit(0)
  },
  error: error => {
    log.error({error: errorFormatter(error)}, "Error on GCP stream. Exiting application")
    delayAndExit(0)
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
  log.error({error: errorFormatter(error)}, "Got an uncaught exception. Exiting application")
  delayAndExit(0)
})
