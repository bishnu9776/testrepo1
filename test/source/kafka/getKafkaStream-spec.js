import {createProducer} from "node-microservice/dist/kafka/producer/create-producer"
import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"
import {clearStub} from "../../stubs/clearStub"
import kafka from "../../../src/source/kafka"
import {log} from "../../../src/logger"
import {createTopic, deleteTopic, produceMessage} from "../../utils/kafka"

describe.skip("Kafka Stream", () => {
  const {env} = process
  let appContext
  const kafkaUrl = "localhost:9092"
  const producerClientConfig = {
    "metadata.broker.list": kafkaUrl,
    "client.id": "test-producer"
  }

  const producerTopicConfig = {
    "request.required.acks": "1"
  }

  const topic = "test-archive-topic-ather"
  const eventsToProduce = ["a", "b", "c"]
  let producer

  beforeEach(async () => {
    env.VI_KAFKA_URL = "localhost:9092"
    env.VI_ATHER_COLLECTOR_KAFKA_CONSUMER_TOPIC = topic
    env.VI_KAFKA_CONSUMER_CLIENT_GROUP_ID = `groupid-${Math.random().toFixed(6) * 10 ** 6}`
    env.VI_KAFKA_CONSUMER_TOPIC_AUTO_OFFSET_RESET = "earliest"
    appContext = {
      log,
      metricRegistry: getMockMetricRegistry()
    }
    await deleteTopic(kafkaUrl, topic)
    await createTopic(kafkaUrl, topic)
    producer = await createProducer({
      parentLog: appContext.log,
      clientConfig: producerClientConfig,
      topicConfig: producerTopicConfig
    })
    await Promise.all(eventsToProduce.map(e => produceMessage(producer, e, topic)))
  })

  afterEach(async () => {
    clearStub()
    producer.disconnect()
    await deleteTopic(kafkaUrl, topic)
  })

  it("get kafka stream", done => {
    // const actualEvents = []
    // subscribe to kafka.stream and see if data is coming
    kafka(appContext).stream.subscribe({
      next: ({message}) => {
        // actualEvents.push(message)
        console.log(message)
      },
      error: e => {
        console.log(e)
      },
      complete: () => {
        console.log("Observer got a complete notification")
        done()
      }
    })
  }).timeout(10000)
})
