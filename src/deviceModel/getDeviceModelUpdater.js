import {retryableRequest} from "node-microservice/dist/retryable-request"
import {makeAxiosRequest} from "../utils/makeAxiosRequest"

const {env} = process

export const getDeviceModelUpdater = ({log, retryConfig}) => {
  const plant = env.VI_PLANT
  const deviceRegistryUrl = env.VI_DEVICE_REGISTRY_DEVICES_URL

  return async ({device, model}) => {
    const requestConfig = {
      url: `${deviceRegistryUrl}/${device}`,
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
}
