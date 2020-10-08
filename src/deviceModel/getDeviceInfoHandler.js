import R from "ramda"
import {fetchDeviceRuleSetMapping} from "./fetchDeviceRuleSetMapping"

export const getDeviceInfoHandler = async appContext => {
  // const {log} = appContext
  // const isRetryable = is5xxError
  // const retryConfig = getRetryConfig(log, isRetryable)
  const deviceRuleSetMapping = await fetchDeviceRuleSetMapping(appContext)
  const shouldUpdateDeviceRules = JSON.parse(process.env.VI_SHOULD_UPDATE_DEVICE_RULES || "false")

  return {
    updateDeviceInfo: async event => {
      if (!shouldUpdateDeviceRules) {
        return Promise.resolve()
      }

      const device = event.device_uuid
      if (R.has(device, deviceRuleSetMapping)) {
        return Promise.resolve()
      }

      // update mapping
    },
    getUpdatedDeviceModelMapping: () => {
      return deviceRuleSetMapping
    }
  }
}
