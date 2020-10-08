import R from "ramda"
import {fetchDeviceRulesetMapping} from "./fetchDeviceRulesetMapping"
import {getDeviceRulesUpdater} from "./getDeviceRulesUpdater"
import {getRetryConfig, is5xxError} from "../utils/getRetryConfig"

export const getDeviceInfoHandler = async appContext => {
  const {log} = appContext
  const isRetryable = is5xxError
  const retryConfig = getRetryConfig(log, isRetryable)
  const deviceRulesetMapping = await fetchDeviceRulesetMapping({log, retryConfig})
  const updateDeviceRules = getDeviceRulesUpdater({log, retryConfig})
  const shouldUpdateDeviceRules = JSON.parse(process.env.VI_SHOULD_UPDATE_DEVICE_RULES || "false")

  return {
    updateDeviceInfo: async event => {
      const device = event.device_uuid
      const deviceExistsInMapping = R.has(device, deviceRulesetMapping)

      if (shouldUpdateDeviceRules && device && !deviceExistsInMapping) {
        const gen = await updateDeviceRules(device)
        if (gen !== null) {
          deviceRulesetMapping[device] = gen
          log.info(`Successfully updated device rules for device: ${device} with ruleset: ${gen}`)
        }
      }

      return event
    },
    getUpdatedDeviceModelMapping: () => deviceRulesetMapping
  }
}
