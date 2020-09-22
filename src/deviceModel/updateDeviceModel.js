import {retryableRequest} from "node-microservice/dist/retryable-request"
import {makeAxiosRequest} from "../utils/makeAxiosRequest"

export const updateDeviceModel = async ({appContext, device, model, retryConfig}) => {
  const {apiConfig, log} = appContext
  const {plant, deviceRegistryUrl} = apiConfig
  const endpoint = `${deviceRegistryUrl}/${device}`
  const requestConfig = {
    url: endpoint,
    method: "PUT",
    data: {model},
    headers: {
      "X-Tenant": plant,
      Authorization: `Bearer ${process.env.VI_JWT}`,
      "Content-Type": "application/json"
    },
    timeout: parseInt(process.env.VI_ATHER_COLLECTOR_REQUEST_TIMEOUT || "30000", 10)
  }

  return retryableRequest({requestConfig, retryConfig, log, makeRequest: makeAxiosRequest})
}
