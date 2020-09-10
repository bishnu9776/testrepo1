import {retryableRequest} from "node-microservice/dist/retryable-request"
import {getAxiosRequest} from "../utils/getAxiosRequest"
import {getRetryConfig, is5xxError} from "../utils/getRetryConfig"
import {errorFormatter} from "../utils/errorFormatter"

const getDeviceModel = async ({apiConfig, getToken, log}) => {
  const {plant, url, subject, permissions} = apiConfig

  const requestConfig = {
    url,
    method: "post",
    data: {fields: ["model"]},
    headers: {
      "X-Tenant": plant,
      Authorization: `Bearer ${getToken(subject, plant, permissions)}`,
      "Content-Type": "application/json"
    },
    timeout: parseInt(process.env.VI_ATHER_COLLECTOR_REQUEST_TIMEOUT || 30000, 10)
  }
  const isRetryable = is5xxError

  const retryConfig = getRetryConfig(log, isRetryable)
  return retryableRequest({requestConfig, retryConfig, log, makeRequest: getAxiosRequest})
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
