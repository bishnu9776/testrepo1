import {handleSignals, getMetricRegistry, createApp} from "node-microservice"
import {log} from "./logger"
import {errorFormatter} from "./utils/errorFormatter"
import {startPipelines, stopPipelines} from "./pipeline/startPipelines"
import {collectProcessStats} from "./metrics/processStats"

const attachEventHandlers = () => {
  const exitHandler = () => {
    stopPipelines()
    return Promise.resolve(null)
  }
  handleSignals(log, exitHandler)
  process.on("unhandledRejection", error => {
    log.warn({error: errorFormatter(error)}, "Got unhandled promise rejection")
    // gcp throws UnhandledPromiseRejectionWarning when modifyAckDeadline fails
    // We do not want to exit the application unnecessarily. Instead, pipeline will resubscribe and continue.
  })
}

const startMain = async () => {
  const metricRegistry = getMetricRegistry(log)
  const appContext = {log, metricRegistry}

  const appConfig = {
    port: parseInt(process.env.VI_PORT || "3000", 10)
  }
  await createApp({port: appConfig.port, log})
  metricRegistry.startStatsReporting()
  collectProcessStats(metricRegistry)
  startPipelines(appContext)
  attachEventHandlers()
}

startMain()
