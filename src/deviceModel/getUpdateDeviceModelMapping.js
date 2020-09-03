import axios from "axios"

export const putDeviceMapping = (appContext, device, model) => {
  const {apiConfig, getToken} = appContext
  const {plant, url, subject, permissions} = apiConfig

  const endpoint = `${url}/${device}`

  return new Promise((resolve, reject) => {
    axios({
      method: "PUT",
      url: endpoint,
      data: {plant, device, model},
      plant,
      headers: {
        "X-Tenant": plant,
        Authorization: `Bearer ${getToken(subject, plant, permissions)}`,
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

export const getUpdateDeviceModelMapping = appContext => {
  return async (deviceModelMapping, event) => {
    const device = event.device_uuid
    const model = event?.value.split("_")[1]
    if (!deviceModelMapping[event.device_uuid] || deviceModelMapping[event.device_uuid] !== model) {
      const response = await putDeviceMapping(appContext, device, model)
      if (response) {
        // eslint-disable-next-line no-param-reassign
        deviceModelMapping[device] = model
      }
    }
    return deviceModelMapping
  }
}
