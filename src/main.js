import {expressApp} from "node-microservice"
import {log} from "./logger"
import {getPipeline} from "./pipeline"
import {errorFormatter} from "./utils/errorFormatter"
import {delayAndExit} from "./utils/delayAndExit"
import appFactory from "./appFactory"

const port = parseInt(process.env.VI_PORT || "3000", 10)
const pipeline = getPipeline({log})
const app = appFactory()

app.listen(port, () =>
  log.info(
    {
      port
    },
    "Starting Ather Collector"
  )
)

const sigExit = signal => {
  if (pipeline && pipeline.unsubscribe) {
    pipeline.unsubscribe()
  }
  log.info(`Exiting due to ${signal}`)
  delayAndExit(1)
}

process.on("SIGINT", () => sigExit("SIGINT"))
process.on("SIGTERM", () => sigExit("SIGTERM"))
process.on("uncaughtException", error => {
  log.error({error: errorFormatter(error)}, "Got an uncaught exception. Exiting application")
  delayAndExit(2)
})
process.on("unhandledRejection", error => {
  log.warn({error: errorFormatter(error)}, "Got unhandled promise rejection")
  // gcp throws UnhandledPromiseRejectionWarning when modifyAckDeadline fails (when not able to connect to gcp)
})
