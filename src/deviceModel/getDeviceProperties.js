import axios from "axios"

export const getDeviceProperties = ({apiConfig, getToken}) => {
  const {plant, url, subject, permissions} = apiConfig

  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url,
      data: {},
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

export const createDeviceModelMapping = async appContext => {
  const deviceProperties = await getDeviceProperties(appContext)
  return deviceProperties.reduce((acc, deviceProperty) => {
    acc[deviceProperty.device] = deviceProperty.model
    return acc
  }, {})
}
