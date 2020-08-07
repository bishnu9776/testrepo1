import {createConsumer} from "node-microservice/dist/kafka"
import {Observable} from "rxjs"
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

  const stream = new Observable(observer => {
    const handleMessage = appContext => {
      return event => {
        const {value, headers} = event
        const topicObj = JSON.parse(JSON.stringify(headers[0].inputTopic))
        const topic = getDevice(topicObj.data)
        observer.next({value, topic})
      }
    }
    const {destroy: unsubscribeConsumer} = createConsumer({...kafkaProps, ...clientConfig}, handleMessage(appContext))
    return () => {
      unsubscribeConsumer()
    }
  })

  return {stream}
}

export default kafka
