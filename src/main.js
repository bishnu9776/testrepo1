import {getGCPstream} from "./gcpSubscriber"
import {kafkaProducer} from "./kafkaProducer"
import {log} from "./logger"

const subscriptionName = "samplesubscription"
const projectId = "udemy-react-nati-1553102095753"
const credentialsPath = "./src/credentials.json"

getGCPstream({subscriptionName, projectId, credentialsPath})
  .pipe(kafkaProducer({log}))
  .subscribe(x => {
    console.log(x)
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
