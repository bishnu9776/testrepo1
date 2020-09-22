import {getRetryConfig, is5xxError} from "../utils/getRetryConfig"
import {errorFormatter} from "../utils/errorFormatter"
import {isNilOrEmpty} from "../utils/isNilOrEmpty"
import {updateDeviceModel} from "./updateDeviceModel"

const extractModel = value => {
  const split = value.split("_")
  return split[1] ? split[1] : split[0]
}

const getModel = event => {
  const valueKey = process.env.VI_VALUE_KEY || "value_event" // TODO: Better name. This env var should reflect that it is value key for the data item being used to update model
  return event && event[valueKey] ? extractModel(event[valueKey]) : null
}

const deviceModelMappingMismatch = ({device, deviceModelMapping, model}) =>
  !deviceModelMapping[device] || deviceModelMapping[device] !== model

const isNewDevice = ({deviceModelMapping, event, device, model}) => {
  const modelDataItems = process.env.VI_DATAITEM_MODEL_LIST
    ? process.env.VI_DATAITEM_MODEL_LIST.split(",")
    : ["bike_type"]
  if (!modelDataItems.includes(event.data_item_name)) {
    return false
  }

  return !isNilOrEmpty(model) && deviceModelMappingMismatch({device, deviceModelMapping, model})
}

export const getDeviceModelMappingUpdater = appContext => {
  const {log} = appContext
  const isRetryable = is5xxError
  const retryConfig = getRetryConfig(log, isRetryable)

  return async (deviceModelMapping, event) => {
    const device = event.device_uuid
    const model = getModel(event)

    if (!isNewDevice({deviceModelMapping, event, device, model})) {
      return deviceModelMapping
    }

    const {ok, response, error} = await updateDeviceModel({appContext, device, model, retryConfig})
    const updatedDeviceModelMapping = {...deviceModelMapping}

    if (ok && response) {
      // eslint-disable-next-line no-param-reassign
      updatedDeviceModelMapping[device] = model
    } else {
      log.warn("Failed to put device model mapping", {error: errorFormatter(error)})
    }
    return updatedDeviceModelMapping
  }
}
