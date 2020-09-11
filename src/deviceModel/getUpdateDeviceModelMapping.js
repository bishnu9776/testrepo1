import {retryableRequest} from "node-microservice/dist/retryable-request"
import {getRetryConfig, is5xxError} from "../utils/getRetryConfig"
import {makeAxiosRequest} from "../utils/makeAxiosRequest"
import {errorFormatter} from "../utils/errorFormatter"
import {isNilOrEmpty} from "../utils/isNilOrEmpty"

export const putDeviceMapping = async ({appContext, device, model}) => {
  const {apiConfig, getToken, log} = appContext
  const {plant, url, subject, permissions} = apiConfig
  const endpoint = `${url}/${device}`
  const requestConfig = {
    url: endpoint,
    method: "PUT",
    data: {model},
    headers: {
      "X-Tenant": plant,
      Authorization: `Bearer ${getToken(subject, plant, permissions)}`,
      "Content-Type": "application/json"
    },
    timeout: parseInt(process.env.VI_ATHER_COLLECTOR_REQUEST_TIMEOUT || "30000", 10)
  }
  const isRetryable = is5xxError

  const retryConfig = getRetryConfig(log, isRetryable)
  return retryableRequest({requestConfig, retryConfig, log, makeRequest: makeAxiosRequest})
}

export const getUpdateDeviceModelMapping = appContext => {
  const {log} = appContext
  const isGen2Data = JSON.parse(process.env.VI_COLLECTOR_IS_GEN_2_DATA || "false")

  return async (deviceModelMapping, event) => {
    const device = event.device_uuid
    const model = isGen2Data ? event?.value : event?.value?.split("_")[1]
    if (
      !isNilOrEmpty(model) &&
      (!deviceModelMapping[event.device_uuid] || deviceModelMapping[event.device_uuid] !== model)
    ) {
      const {ok, response, error} = await putDeviceMapping({appContext, device, model})
      if (ok && response) {
        // eslint-disable-next-line no-param-reassign
        deviceModelMapping[device] = model
      } else {
        log.warn("Failed to put device model mapping", {error: errorFormatter(error)})
      }
    }
    return deviceModelMapping
  }
}
