import {retryableRequest} from "node-microservice/dist/retryable-request"
import {makeAxiosRequest} from "../utils/makeAxiosRequest"

export const updateDeviceRules = ({device, rulesetName, appContext, retryConfig}) => {
  const {apiConfig, log} = appContext
  const {plant, deviceRulesUrl} = apiConfig
  const endpoint = `${deviceRulesUrl}/foo/${device}/${rulesetName}`
  const requestConfig = {
    url: endpoint,
    method: "PUT",
    headers: {
      "X-Tenant": plant,
      Authorization: `Bearer ${process.env.VI_JWT}`,
      "Content-Type": "application/json"
    },
    timeout: parseInt(process.env.VI_ATHER_COLLECTOR_REQUEST_TIMEOUT || "30000", 10)
  }

  return retryableRequest({requestConfig, retryConfig, log, makeRequest: makeAxiosRequest})
}
