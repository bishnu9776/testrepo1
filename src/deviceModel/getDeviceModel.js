import axios from "axios"
import getJwtConfig from "../utils/getJWTConfig"
import {tokenGenerator} from "../utils/tokenGenerator"

export const getDeviceModel = () => {
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
      plant,
      headers: {
        "X-Tenant": plant,
        Authorization: `Bearer ${getToken(apiConfig.subject, plant, apiConfig.permissions)}`,
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        const devices = resolve(response.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}
