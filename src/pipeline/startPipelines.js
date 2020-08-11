import {createProducer} from "node-microservice/dist/kafka/producer/create-producer"
import {log} from "../logger"
import {getPipeline} from "./getPipeline"
import {getMetricRegistry} from "../metrics/metricRegistry"
import {collectProcessStats} from "../metrics/processStats"
import {getSourceStream} from "../source"

const {env} = process

const pipelines = []

const getProbeMapping = () => env.VI_COLLECTOR_PROBE_PATH

export const startPipelines = async () => {
  const kafkaProps = {
    parentLog: log
  }
  const kafkaProducer = await createProducer(kafkaProps)
  const metricRegistry = getMetricRegistry(log)
  const appContext = {log, metricRegistry}

  metricRegistry.startStatsReporting()
  collectProcessStats(metricRegistry)
  const source = await getSourceStream(appContext)

  pipelines.push(
    getPipeline({
      source,
      appContext,
      probePath: getProbeMapping(),
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
