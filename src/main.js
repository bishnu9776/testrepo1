import {expressApp} from "node-microservice"
import eventLoopStats from "event-loop-stats"
import {log} from "./logger"
import {getMetricRegistry} from "./metricRegistry"
import {getPipeline} from "./pipeline"
import {errorFormatter} from "./utils/errorFormatter"
import appFactory from "./appFactory"

const delayAndExit = (exitCode, delayMs = 5000) => {
  setTimeout(() => {
    process.exit(exitCode)
  }, delayMs)
}

let probe
try {
  probe = require(process.env.VI_COLLECTOR_PROBE_PATH) // eslint-disable-line
} catch (e) {
  log.error({error: errorFormatter(e)}, "Could not load probe. Exiting process")
  delayAndExit(0)
}

const metricRegistry = getMetricRegistry(log)
const pipeline = getPipeline({metricRegistry, probe, log})

metricRegistry.startStatsReporting()

const app = appFactory()
const port = parseInt(process.env.VI_PORT || "3000", 10)

app.listen(port, () =>
  log.info(
    {
      port
    },
    "Starting Ather Collector"
  )
)

pipeline.subscribe({
  complete: () => {
    log.error("GCP stream completed. Exiting application")
    delayAndExit(0)
  },
  error: error => {
    log.error({error: errorFormatter(error)}, "Error on GCP stream. Exiting application")
    delayAndExit(0)
  }
})

const sigExit = signal => {
  if (pipeline && pipeline.unsubscribe) {
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
process.on("unhandledRejection", error => {
  log.warn({error: errorFormatter(error)}, "Got unhandled promise rejection")
  // gcp throws UnhandledPromiseRejectionWarning when modifyAckDeadline fails (when not able to connect to gcp)
})

const statsInterval = parseInt(process.env.VI_STATS_INTERVAL, 10) || 10000
setInterval(() => {
  const {sum, max, num} = eventLoopStats.sense()
  metricRegistry.updateStat("Max", "max_event_loop_duration", max, {})
  metricRegistry.updateStat("Gauge", "average_event_loop_duration", sum / num, {})
}, statsInterval)
