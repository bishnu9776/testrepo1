import {retryableRequest} from "node-microservice/dist/retryable-request"
import {makeAxiosRequest} from "../utils/makeAxiosRequest"
import {errorFormatter} from "../utils/errorFormatter"

const {env} = process

const getDeviceRuleset = async ({log, retryConfig}) => {
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

export const fetchDeviceRulesetMapping = async ({log, retryConfig}) => {
  const {ok, response, error} = await getDeviceRuleset({log, retryConfig})
  if (ok && response.data) {
    const deviceRulesets = response.data
    const deviceRulesetMapping = deviceRulesets.reduce((acc, deviceRuleset) => {
      acc[deviceRuleset.device] = deviceRuleset.ruleset
      return acc
    }, {})

    log.info("Received device ruleset mapping from device rules", {
      ctx: {deviceRuleset: JSON.stringify(deviceRulesetMapping)}
    })

    return deviceRulesetMapping
  }

  log.error("Failed to get device rule set", {error: errorFormatter(error)})

  return {}
}
