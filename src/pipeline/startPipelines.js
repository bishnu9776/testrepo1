import {createProducer} from "node-microservice/dist/kafka/producer/create-producer"
import {log} from "../logger"
import {getPipeline} from "./getPipeline"
import {getMetricRegistry} from "../metrics/metricRegistry"
import {collectProcessStats} from "../metrics/processStats"
import {getSourceStream} from "../source"
import {tokenGenerator} from "../utils/tokenGenerator"
import {getJwtConfig} from "../utils/getJWTConfig"

const {env} = process

const pipelines = []

export const startPipelines = async () => {
  const kafkaProps = {
    parentLog: log
  }
  const kafkaProducer = await createProducer(kafkaProps)
  const metricRegistry = getMetricRegistry(log)
  const getToken = tokenGenerator(getJwtConfig())
  const apiConfig = {
    plant: env.VI_PLANT || "ather",
    url: env.VI_SVC_DEVICE_REGISTRY_URL || "https://svc-device-registry.com/device-registry/devices",
    subject: env.VI_NAME || "svc-ather-collector",
    permissions: env.VI_SVC_ATHER_COLLECTOR_PERMISSIONS ? env.VI_SVC_ATHER_COLLECTOR_PERMISSIONS.split(",") : []
  }

  const appContext = {log, metricRegistry, apiConfig, getToken}

  metricRegistry.startStatsReporting()
  collectProcessStats(metricRegistry)
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
