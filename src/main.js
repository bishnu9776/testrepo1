import {getGCPstream} from "./gcpSubscriber"
import {kafkaProducer} from "./kafkaProducer"
import {log} from "./logger"

const subscriptionName = "samplesubscription"
const projectId = "udemy-react-nati-1553102095753"
const credentialsPath = "./src/credentials.json"

const pipeline = getGCPstream({subscriptionName, projectId, credentialsPath})
  .pipe(kafkaProducer({log}))
  .subscribe({
    next: x => {
      // console.log(x)
    },
    complete: () => {
      console.log("Completed. Exiting application")
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
    pipeline.close()
  }
  log.info(`Exiting due to ${signal}`)
  delayAndExit(0)
}

process.on("SIGINT", () => sigExit("SIGINT"))
process.on("SIGTERM", () => sigExit("SIGTERM"))
process.on("uncaughtException", error => {
  const errorMsg = error.message || error
  log.error({uncaughtError: JSON.stringify(error)}, "Uncaught exception: ", JSON.stringify(errorMsg))
  pipeline.close()
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
