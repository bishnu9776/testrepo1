import R from "ramda"
import {fetchDeviceRuleSetMapping} from "./fetchDeviceRuleSetMapping"
import {getDeviceRulesUpdater} from "./getDeviceRulesUpdater"
import {getRetryConfig, is5xxError} from "../utils/getRetryConfig"

export const getDeviceInfoHandler = async appContext => {
  const {log} = appContext
  const isRetryable = is5xxError
  const retryConfig = getRetryConfig(log, isRetryable)
  const deviceRuleSetMapping = await fetchDeviceRuleSetMapping(appContext)
  const deviceRulesUpdater = getDeviceRulesUpdater({log, retryConfig})
  const shouldUpdateDeviceRules = JSON.parse(process.env.VI_SHOULD_UPDATE_DEVICE_RULES || "false")

  return {
    updateDeviceInfo: async event => {
      if (!shouldUpdateDeviceRules) {
        return
      }

      const device = event.device_uuid
      if (R.has(device, deviceRuleSetMapping)) {
        return
      }

      const gen = await deviceRulesUpdater(device)
      deviceRuleSetMapping[device] = gen
    },
    getUpdatedDeviceModelMapping: () => deviceRuleSetMapping
  }
}
