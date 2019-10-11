import {concatAll, concatMap, filter, map, tap} from "rxjs/operators"
import {from} from "rxjs"
import {getGCPstream} from "./gcpSubscriber"
import {kafkaProducer} from "./kafkaProducer"
import {log} from "./logger"
import {formatData} from "./formatData"
import {getMetricRegistry} from "./metricRegistry"

const {env} = process
const subscriptionName = env.VI_GCP_PUBSUB_SUBSCRIPTION || "samplesubscription"
const projectId = env.VI_GCP_PROJECT_ID || "udemy-react-nati-1553102095753"
const credentialsPath = env.VI_GCP_SERVICE_ACCOUNT_CREDS_FILE_PATH || "./src/credentials.json"

const metricRegistry = getMetricRegistry(log)
metricRegistry.startStatsReporting()

// TODO
// 1. Errors on gcp stream will be caught in kafka producer - fix this
// 2. Attach actual message with prototype to be able to ack messages.

// connectToKafka()

const {acknowledgeMessage, stream: gcpStream} = getGCPstream({
  subscriptionName,
  projectId,
  credentialsPath,
  metricRegistry,
  log
})

const pipeline = gcpStream
  .pipe(
    map(formatData(log)),
    filter(x => !!x),
    concatMap(events => from(events)),
    concatAll(),
    kafkaProducer({log, metricRegistry}),
    filter(event => event.type === "ack"),
    tap(event => acknowledgeMessage(event.message))
  )
  // retry with exponential back off on errors
  .subscribe({
    next: x => {
      console.log(x)
    },
    complete: () => {
      console.log("Completed. Exiting application")
      process.exit(0)
    }
  })

// Add timeout for entire stream if no messages for some time

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
  delayAndExit(1)
})

// getGCPStream
// formatData
// getKafkaProducer
// pipe GCP stream to producer

// Set ackDeadline and flow control settings explicitly

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
