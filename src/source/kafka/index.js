import {createConsumer} from "node-microservice/dist/kafka"
import {Observable} from "rxjs"
import {kafkaStream} from "./kafkaStream"

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

  const stream = new Observable(observer => {
    const {destroy: unsubscribeConsumer} = createConsumer(
      {...kafkaProps, ...clientConfig},
      kafkaStream(appContext, observer)
    )
    return () => {
      unsubscribeConsumer()
    }
  })

  return {stream}
}

export default kafka
