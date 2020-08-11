import {createConsumer} from "node-microservice/dist/kafka"
import {Observable} from "rxjs"
import {kafkaStream} from "./kafkaStream"

const kafka = appContext => {
  const {log} = appContext
  const kafkaProps = {
    parentLog: log
  }

  const stream = new Observable(observer => {
    const processEvent = kafkaStream(appContext, observer)

    const {destroy: unsubscribeConsumer} = createConsumer({...kafkaProps}, processEvent)
    return () => {
      unsubscribeConsumer()
    }
  })

  return {stream}
}

export default kafka
