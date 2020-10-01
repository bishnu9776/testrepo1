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
  const valueKey = process.env.VI_VALUE_KEY || "value_event"
  return event && event[valueKey] ? extractModel(event[valueKey]) : null
}

const getDevice = event => event.device_uuid

const deviceModelMappingMismatch = ({device, deviceModelMapping, model}) =>
  !deviceModelMapping[device] || deviceModelMapping[device] !== model

const isNewDeviceOrUpdatedModel = ({deviceModelMapping, event}) => {
  const modelDataItems = process.env.VI_DATAITEM_MODEL_LIST ? process.env.VI_DATAITEM_MODEL_LIST.split(",") : []
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
  const shouldUpdateDeviceRulesEnv = JSON.parse(process.env.VI_SHOULD_UPDATE_DEVICE_RULES || "false")
  const deviceRules = {}
  const deviceHasNoAssociatedRules = (device, model) => model && !deviceRules[device]

  return {
    updateDeviceInfo: async event => {
      const device = getDevice(event)
      const model = getModel(event)

      const shouldUpdateDeviceRules =
        shouldUpdateDeviceRulesEnv &&
        (isNewDeviceOrUpdatedModel({deviceModelMapping, event}) || deviceHasNoAssociatedRules(device, model))
      // TODO: Write test for device rules for null model

      if (shouldUpdateDeviceRules) {
        const deviceRulesResponse = await updateDeviceRules({device, model})

        if (!isSuccessfulRequest(deviceRulesResponse)) {
          log.warn(`Failed to update rules for device: ${device} with model: ${model}`, {
            error: errorFormatter(deviceRulesResponse.error)
          })
        } else {
          log.info(`Successfully updated device rules for device: ${device} with model: ${model}`)
          deviceRules[device] = true
        }
      }

      if (!isNewDeviceOrUpdatedModel({deviceModelMapping, event})) {
        return deviceModelMapping
      }

      const deviceModelResponse = await updateDeviceModel({device, model})

      if (!isSuccessfulRequest(deviceModelResponse)) {
        log.warn(`Failed to update device model mapping for device: ${device} with model: ${model}`, {
          error: errorFormatter(deviceModelResponse.error)
        })
        return deviceModelMapping
      }

      log.info(`Successfully updated device registry for device: ${device} with model: ${model}`)

      deviceModelMapping[device] = model
      return deviceModelMapping
    },
    getUpdatedDeviceModelMapping: () => {
      return deviceModelMapping
    }
  }
}
