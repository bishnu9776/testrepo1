import {PubSub} from "@google-cloud/pubsub"

const topicName = "sampletopic"
const projectId = "udemy-react-nati-1553102095753"
const keyFilename = "./src/credentials.json"

const pubsubclient = new PubSub({
  projectId,
  keyFilename
})

const numMessagesToSend = 100
let numMessagesSent = 0
const getSampleDoc = seq =>
  Buffer.from(
    JSON.stringify({
      data: "some-data",
      sequence: seq
    })
  )

while (numMessagesSent < numMessagesToSend) {
  numMessagesSent++
  const messageToSend = getSampleDoc(numMessagesSent)
  pubsubclient.topic(topicName).publish(messageToSend, (err, _) => {
    if (err) {
      console.log("Exiting due to error", err)
      process.exit(1)
    }
  })
  pubsubclient.topic(topicName)
}
