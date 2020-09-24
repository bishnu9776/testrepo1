/* eslint-disable */

import {retryableRequest} from "node-microservice/dist/retryable-request"
import {makeAxiosRequest} from "../utils/makeAxiosRequest"

const {env} = process

export const getDeviceRulesUpdater = ({log, retryConfig}) => {
  const plant = env.VI_PLANT
  const deviceRulesUrl = env.VI_DEVICE_RULES_DEVICE_URL

  return async ({device, model}) => {
    const requestConfig = {
      url: `${deviceRulesUrl}/${device}/${model}`,
      method: "PUT",
      headers: {
        "X-Tenant": plant,
        Authorization: `Bearer ${process.env.VI_JWT}`,
        "Content-Type": "application/json"
      },
      timeout: parseInt(process.env.VI_ATHER_COLLECTOR_REQUEST_TIMEOUT || "30000", 10)
    }
    return retryableRequest({requestConfig, retryConfig, log, makeRequest: makeAxiosRequest})
    // return {
    //   ok: true,
    //   response: "okay"
    // }
  }
}
