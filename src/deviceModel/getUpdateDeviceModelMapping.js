import axios from "axios"
import {getJwtConfig} from "../utils/getJWTConfig"
import {tokenGenerator} from "../utils/tokenGenerator"

export const putDeviceMapping = (device, model) => {
  const plant = "ather"
  const {env} = process
  const jwtConfig = getJwtConfig()
  const getToken = tokenGenerator(jwtConfig)

  const apiConfig = {
    url: env.VI_SVC_DEVICE_REGISTRY_URL || "https://svc-device-registry.com/device-registry/devices",
    subject: env.VI_NAME || "svc-ather-collector",
    permissions: env.VI_SVC_ATHER_COLLECTOR_PERMISSIONS ? env.VI_SVC_ATHER_COLLECTOR_PERMISSIONS.split(",") : []
  }
  const endpoint = `${apiConfig.url}/${device}`

  return new Promise((resolve, reject) => {
    axios({
      method: "PUT",
      url: endpoint,
      data: {plant, device, model},
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

export const getUpdateDeviceModelMapping = async (deviceModelMapping, event) => {
  const device = event.device_uuid
  const model = event?.value.split("_")[1]
  if (!deviceModelMapping[event.device_uuid] || deviceModelMapping[event.device_uuid] !== model) {
    const response = putDeviceMapping(device, model)
    if (response) {
      // eslint-disable-next-line no-param-reassign
      deviceModelMapping[device] = model
    }
  }
  return deviceModelMapping
}
