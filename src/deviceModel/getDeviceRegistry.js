import axios from "axios"
import {tokenGenerator} from "../utils/tokenGenerator"
import {getJwtConfig} from "../utils/getJWTConfig"

export const getDeviceRegistry = () => {
  const plant = "ather"
  const {env} = process
  const jwtConfig = getJwtConfig()
  const getToken = tokenGenerator(jwtConfig)

  const apiConfig = {
    url: env.VI_SVC_DEVICE_REGISTRY_URL || "https://svc-device-registry.com/device-registry/devices",
    subject: env.VI_NAME || "svc-ather-collector",
    permissions: env.VI_SVC_ATHER_COLLECTOR_PERMISSIONS ? env.VI_SVC_ATHER_COLLECTOR_PERMISSIONS.split(",") : []
  }

  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url: apiConfig.url,
      data: {plant: "ather"},
      plant,
      headers: {
        "X-Tenant": plant,
        Authorization: `Bearer ${getToken(apiConfig.subject, plant, apiConfig.permissions)}`,
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        resolve(response.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

export const createDeviceModelMapping = async () => {
  const deviceRegistry = await getDeviceRegistry()
  return deviceRegistry.reduce((acc, registryItem) => {
    acc[registryItem.device] = registryItem.model
    return acc
  }, {})
}
