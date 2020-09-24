import {getRetryConfig, is5xxError} from "../utils/getRetryConfig"
import {errorFormatter} from "../utils/errorFormatter"
import {isNilOrEmpty} from "../utils/isNilOrEmpty"
import {getDeviceModelUpdater} from "./getDeviceModelUpdater"
import {getDeviceRulesUpdater} from "./getDeviceRulesUpdater"
import {fetchDeviceModelMapping} from "./fetchDeviceModelMapping"

const extractModel = value => {
  const split = value.split("_")
  return split[1] ? split[1] : split[0]
}

const getModel = event => {
  const valueKey = process.env.VI_VALUE_KEY || "value_event" // TODO: Better name. This env var should reflect that it is value key for the data item being used to update model
  return event && event[valueKey] ? extractModel(event[valueKey]) : null
}

const getDevice = event => event.device_uuid

const deviceModelMappingMismatch = ({device, deviceModelMapping, model}) =>
  !deviceModelMapping[device] || deviceModelMapping[device] !== model

const isNewDevice = ({deviceModelMapping, event}) => {
  const modelDataItems = process.env.VI_DATAITEM_MODEL_LIST
    ? process.env.VI_DATAITEM_MODEL_LIST.split(",")
    : ["bike_type"]
  if (!modelDataItems.includes(event.data_item_name)) {
    return false
  }

  const model = getModel(event)

  return !isNilOrEmpty(model) && deviceModelMappingMismatch({device: getDevice(event), deviceModelMapping, model})
}

const isSuccessfulRequest = apiResponse => {
  const {ok, response} = apiResponse
  return ok && response
}

export const getDeviceInfoHandler = async appContext => {
  const {log} = appContext
  const isRetryable = is5xxError
  const retryConfig = getRetryConfig(log, isRetryable)
  const deviceModelMapping = await fetchDeviceModelMapping(appContext)
  const updateDeviceModel = getDeviceModelUpdater({log, retryConfig})
  const updateDeviceRules = getDeviceRulesUpdater({log, retryConfig})

  return {
    updateDeviceInfo: async event => {
      if (!isNewDevice({deviceModelMapping, event})) {
        return deviceModelMapping
      }

      const device = getDevice(event)
      const model = getModel(event)

      const deviceRulesResponse = await updateDeviceRules({device, rulesetName: model, appContext, retryConfig})

      if (!isSuccessfulRequest(deviceRulesResponse)) {
        log.warn(`Failed to update rules for device: ${device} with model: ${model}`, {
          error: errorFormatter(deviceModelResponse.error)
        })
        return deviceModelMapping
      }

      const deviceModelResponse = await updateDeviceModel({device, model})

      if (!isSuccessfulRequest(deviceModelResponse)) {
        log.warn(`Failed to update device model mapping for device: ${device} with model: ${model}`, {
          error: errorFormatter(deviceModelResponse.error)
        })
        return deviceModelMapping
      }

      deviceModelMapping[device] = model
      return deviceModelMapping
    },
    getUpdatedDeviceModelMapping: () => {
      return deviceModelMapping
    }
  }
}
