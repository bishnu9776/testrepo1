import {retryableRequest} from "node-microservice/dist/retryable-request"
import {getRetryConfig, is5xxError} from "../utils/getRetryConfig"
import {makeAxiosRequest} from "../utils/makeAxiosRequest"
import {errorFormatter} from "../utils/errorFormatter"
import {isNilOrEmpty} from "../utils/isNilOrEmpty"

export const putDeviceMapping = async ({appContext, device, model, retryConfig}) => {
  const {apiConfig, log} = appContext
  const {plant, url} = apiConfig
  const endpoint = `${url}/${device}`
  const requestConfig = {
    url: endpoint,
    method: "PUT",
    data: {model},
    headers: {
      "X-Tenant": plant,
      Authorization: `Bearer ${process.env.VI_JWT}`,
      "Content-Type": "application/json"
    },
    timeout: parseInt(process.env.VI_ATHER_COLLECTOR_REQUEST_TIMEOUT || "30000", 10)
  }

  return retryableRequest({requestConfig, retryConfig, log, makeRequest: makeAxiosRequest})
}

const getModel = value => {
  const split = value.split("_")
  return split[1] ? split[1] : split[0]
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export const getDeviceModelMappingUpdater = appContext => {
  const {log} = appContext
  const deviceModelMappingMismatch = ({device, deviceModelMapping, model}) =>
    !deviceModelMapping[device] || deviceModelMapping[device] !== model
  const isRetryable = is5xxError
  const retryConfig = getRetryConfig(log, isRetryable)
  const valueKey = process.env.VI_VALUE_KEY || "value_event" // TODO: Better name. This env var should reflect that it is value key for the data item being used to update model
  const modelDataItems = process.env.VI_DATAITEM_MODEL_LIST
    ? process.env.VI_DATAITEM_MODEL_LIST.split(",")
    : ["bike_type"]

  return async (deviceModelMapping, event) => {
    if (!modelDataItems.includes(event.data_item_name)) {
      return
    }

    const device = event.device_uuid
    const model = event && event[valueKey] ? getModel(event[valueKey]) : null
    if (!isNilOrEmpty(model) && deviceModelMappingMismatch({device, deviceModelMapping, model})) {
      const {ok, response, error} = await putDeviceMapping({appContext, device, model, retryConfig})
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
