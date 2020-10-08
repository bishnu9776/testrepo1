import {retryableRequest} from "node-microservice/dist/retryable-request"
import {makeAxiosRequest} from "../utils/makeAxiosRequest"
import {errorFormatter} from "../utils/errorFormatter"

const {env} = process

const getDeviceRuleSet = async ({log, retryConfig}) => {
  const plant = env.VI_PLANT
  const deviceRulesUrl = env.VI_DEVICE_RULES_URL
  const requestConfig = {
    url: `${deviceRulesUrl}/device/ruleset`,
    method: "get",
    headers: {
      "X-Tenant": plant,
      Authorization: `Bearer ${process.env.VI_JWT}`,
      "Content-Type": "application/json"
    },
    timeout: parseInt(process.env.VI_ATHER_COLLECTOR_REQUEST_TIMEOUT || 30000, 10)
  }

  return retryableRequest({requestConfig, retryConfig, log, makeRequest: makeAxiosRequest})
}

export const fetchDeviceRuleSetMapping = async ({log, retryConfig}) => {
  const {ok, response, error} = await getDeviceRuleSet({log, retryConfig})
  if (ok && response.data) {
    const deviceRuleSets = response.data
    const deviceRuleSetMapping = deviceRuleSets.reduce((acc, deviceRuleSet) => {
      acc[deviceRuleSet.device] = deviceRuleSet.ruleset
      return acc
    }, {})
    log.info("Received device ruleset mapping from device rules", {
      ctx: {deviceRuleSet: JSON.stringify(deviceRuleSetMapping)}
    })
    return deviceRuleSetMapping
  }
  log.warn("Failed to get device rule set", {error: errorFormatter(error)})
  return {}
}
