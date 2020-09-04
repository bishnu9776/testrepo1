import {retryableRequest} from "../utils/retryable-request"
import {getAxiosRequest} from "./getAxiosRequest"
import {getRetryConfig, is5xxError} from "./getRetryConfig"

export const getDeviceProperties = async ({apiConfig, getToken, log}) => {
  const {plant, url, subject, permissions} = apiConfig

  const requestConfig = {
    url,
    method: "post",
    data: {},
    headers: {
      "X-Tenant": plant,
      Authorization: `Bearer ${getToken(subject, plant, permissions)}`,
      "Content-Type": "application/json"
    },
    timeout: parseInt(process.env.VI_ATHER_COLLECTOR_REQUEST_TIMEOUT || 30000, 10)
  }
  const isRetryable = is5xxError()

  const retryConfig = getRetryConfig(log, isRetryable)
  const {ok, response} = await retryableRequest({requestConfig, retryConfig, log, makeRequest: getAxiosRequest})
  if (!ok) {
    log.warn("collector was not able to get device model mapping from device registry")
  }
  return response.data
}

export const createDeviceModelMapping = async appContext => {
  const deviceProperties = await getDeviceProperties(appContext)
  return deviceProperties.reduce((acc, deviceProperty) => {
    acc[deviceProperty.device] = deviceProperty.model
    return acc
  }, {})
}
