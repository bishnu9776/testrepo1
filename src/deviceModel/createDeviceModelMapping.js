import {retryableRequest} from "node-microservice/dist/retryable-request"
import {makeAxiosRequest} from "../utils/makeAxiosRequest"
import {getRetryConfig, is5xxError} from "../utils/getRetryConfig"
import {errorFormatter} from "../utils/errorFormatter"

const getDeviceModel = async ({apiConfig, log}) => {
  const {plant, url} = apiConfig

  const requestConfig = {
    url,
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

export const createDeviceModelMapping = async appContext => {
  const {log} = appContext
  const {ok, response, error} = await getDeviceModel(appContext)
  if (ok && response.data) {
    const deviceProperties = response.data
    return deviceProperties.reduce((acc, deviceProperty) => {
      acc[deviceProperty.device] = deviceProperty.model
      return acc
    }, {})
  }
  log.warn("Failed to get device model mapping", {error: errorFormatter(error)})
  return {}
}
