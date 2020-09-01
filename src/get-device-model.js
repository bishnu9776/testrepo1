import tokenGenerator from "utils/get-token"
import axios from "axios"

export const getDeviceModel = () => {
  const plant = "ather"
  const {env} = process

  const apiConfig = {
    url: env.VI_SVC_DEVICE_REGISTRY_URL || "https://app.staging.ather.vimana.us/api/v3/device-registry/devices",
    subject: env.VI_NAME || "svc-ather-collector",
    permissions: env.VI_SVC_ATHER_COLLECTOR_PERMISSIONS ? env.VI_SVC_ATHER_COLLECTOR_PERMISSIONS.split(",") : []
  }

  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url: apiConfig.url,
      data: {},
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
