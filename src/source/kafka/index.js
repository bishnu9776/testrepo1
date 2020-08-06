import {createConsumer} from "node-microservice/dist/kafka"
import {getKafkaStream} from "./getKafkaStream"

const kafka = appContext => {
  const {env} = process
  const {log} = appContext
  const kafkaProps = {
    parentLog: log
  }

  const kafkaURL = env.VI_KAFKA_URL
  const kafkaConsumerTopic = env.VI_ATHER_COLLECTOR_KAFKA_CONSUMER_TOPIC
  const clientConfig = {
    clientConfig: {
      "metadata.broker.list": kafkaURL
    },
    options: {
      topics: kafkaConsumerTopic
    }
  }

  createConsumer({...kafkaProps, ...clientConfig}, getKafkaStream(appContext))
}

export default kafka
