/* eslint-disable */

import {retryableRequest} from "node-microservice/dist/retryable-request"
import {makeAxiosRequest} from "../utils/makeAxiosRequest"
import {errorFormatter} from "../utils/errorFormatter";

const {env} = process

export const getDeviceRulesUpdater = ({log, retryConfig}) => {
  const plant = env.VI_PLANT
  const deviceRulesUrl = env.VI_DEVICE_RULES_URL
  const gen = JSON.parse(env.VI_COLLECTOR_IS_GEN_2_DATA || "false") ? "gen-2" : "gen-1"

  return async device => {
    const requestConfig = {
      url: `${deviceRulesUrl}/device/${device}/${gen}`,
      method: "PUT",
      headers: {
        "X-Tenant": plant,
        Authorization: `Bearer ${process.env.VI_JWT}`,
        "Content-Type": "application/json"
      },
      timeout: parseInt(process.env.VI_ATHER_COLLECTOR_REQUEST_TIMEOUT || "30000", 10)
    }

    const {error} = await retryableRequest({requestConfig, retryConfig, log, makeRequest: makeAxiosRequest})
    if (error) {
      log.warn(`Failed to update device rule set for device ${device} with ruleset ${gen}`, {error: errorFormatter(error)})
      return null
    }

    return gen
  }
}
