import {handleSignals} from "node-microservice"
import {log} from "./logger"
import {errorFormatter} from "./utils/errorFormatter"
import appFactory from "./appFactory"
import {startPipelines, stopPipelines} from "./pipeline/startPipelines"

const port = parseInt(process.env.VI_PORT || "3000", 10)

const app = appFactory()

app.listen(port, () => {
  log.info({port}, "Starting Ather Collector")
  startPipelines()
})

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
