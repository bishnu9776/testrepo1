import {getRetryConfig, is5xxError} from "./getRetryConfig"
import {retryableRequest} from "../utils/retryable-request"
import {getAxiosRequest} from "./getAxiosRequest"

export const putDeviceMapping = async ({appContext, device, model}) => {
  const {apiConfig, getToken, log} = appContext
  const {plant, url, subject, permissions} = apiConfig
  const endpoint = `${url}/${device}`
  const requestConfig = {
    url: endpoint,
    method: "PUT",
    data: {plant, device, model},
    headers: {
      "X-Tenant": plant,
      Authorization: `Bearer ${getToken(subject, plant, permissions)}`,
      "Content-Type": "application/json"
    },
    timeout: parseInt(process.env.VI_ATHER_COLLECTOR_REQUEST_TIMEOUT || "30000", 10)
  }
  const isRetryable = is5xxError

  const retryConfig = getRetryConfig(log, isRetryable)
  return retryableRequest({requestConfig, retryConfig, log, makeRequest: getAxiosRequest})
}

export const getUpdateDeviceModelMapping = appContext => {
  const {log} = appContext
  return async (deviceModelMapping, event) => {
    const device = event.device_uuid
    const model = event?.value.split("_")[1]
    if (!deviceModelMapping[event.device_uuid] || deviceModelMapping[event.device_uuid] !== model) {
      const {ok, response} = await putDeviceMapping({appContext, device, model})

      if (ok && response.data) {
        // eslint-disable-next-line no-param-reassign
        deviceModelMapping[device] = model
      } else {
        log.warn("collector was not able to update the device mapping in device registry")
      }
    }
    return deviceModelMapping
  }
}
