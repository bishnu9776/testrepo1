import {createProducer} from "node-microservice/dist/kafka/producer/create-producer"
import {getPipeline} from "./getPipeline"
import {getSourceStream} from "../source"

const {env} = process

const pipelines = []

export const startPipelines = async appContext => {
  const {log} = appContext
  const kafkaProps = {
    parentLog: log
  }
  const kafkaProducer = await createProducer(kafkaProps)
  const source = await getSourceStream(appContext)

  pipelines.push(
    getPipeline({
      source,
      appContext,
      probePath: env.VI_COLLECTOR_PROBE_PATH,
      kafkaProducer
    })
  )
}

export const stopPipelines = () => {
  pipelines.forEach(pipeline => {
    if (pipeline && pipeline.unsubscribe) {
      pipeline.unsubscribe()
    }
  })
}
