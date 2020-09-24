import {retryableRequest} from "node-microservice/dist/retryable-request"
import {makeAxiosRequest} from "../utils/makeAxiosRequest"
import {getRetryConfig, is5xxError} from "../utils/getRetryConfig"
import {errorFormatter} from "../utils/errorFormatter"

const {env} = process

const fetchDeviceModelInfo = async ({log}) => {
  const plant = env.VI_PLANT
  const deviceRegistryUrl = env.VI_DEVICE_REGISTRY_DEVICES_URL
  const requestConfig = {
    url: deviceRegistryUrl,
    method: "post",
    data: {fields: ["model", "device"]},
    headers: {
      "X-Tenant": plant,
      Authorization: `Bearer ${process.env.VI_JWT}`,
      "Content-Type": "application/json"
    },
    timeout: parseInt(process.env.VI_ATHER_COLLECTOR_REQUEST_TIMEOUT || 30000, 10)
  }
  const isRetryable = is5xxError

  const retryConfig = getRetryConfig(log, isRetryable)
  return retryableRequest({requestConfig, retryConfig, log, makeRequest: makeAxiosRequest})
}

export const getDeviceModelMapping = async appContext => {
  const {log} = appContext
  const {ok, response, error} = await fetchDeviceModelInfo({log})
  if (ok && response.data) {
    const deviceProperties = response.data
    const deviceModelMapping = deviceProperties.reduce((acc, deviceProperty) => {
      acc[deviceProperty.device] = deviceProperty.model
      return acc
    }, {})
    log.info("Received device model mapping from device registry", {
      ctx: {deviceModelMapping: JSON.stringify(deviceModelMapping)}
    })
    return deviceModelMapping
  }
  log.warn("Failed to get device model mapping", {error: errorFormatter(error)})
  return {}
}
