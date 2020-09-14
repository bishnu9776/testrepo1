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

const getModel = event => {
  const split = event.value.split("_")
  return split[1] ? split[1] : split[0]
}

export const getUpdateDeviceModelMapping = appContext => {
  const {log} = appContext
  const deviceModelMappingMismatch = ({device, deviceModelMapping, model}) =>
    !deviceModelMapping[device] || deviceModelMapping[device] !== model

  return async (deviceModelMapping, event) => {
    const device = event.device_uuid
    const model = event && event.value ? getModel(event) : null
    if (!isNilOrEmpty(model) && deviceModelMappingMismatch({device, deviceModelMapping, model})) {
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
