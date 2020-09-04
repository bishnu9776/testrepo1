import {retryableRequest} from "../utils/retryable-request"
import {getAxiosRequest} from "./getAxiosRequest";
import {getRetryConfig, is5xxError} from "./getRetryConfig";

export const getDeviceProperties = async ({apiConfig, getToken, log}) => {
  const {plant, url, subject, permissions} = apiConfig

  const requestConfig = {
    url,
    method: "post",
    data: {},
    headers: {
      "X-Tenant": plant,
      Authorization: `Bearer ${getToken(subject, plant, permissions)}`,
      "Content-Type": "application/json"
    },
    timeout: 30000 // TODO: change this to ENV
  }
  const isRetryable = is5xxError()

  const retryConfig = getRetryConfig(log, isRetryable)
  // return new Promise((resolve, reject) => {
  //   axios({
  //     method: "POST",
  //     url,
  //     data: {},
  //     plant,
  //     headers: {
  //       "X-Tenant": plant,
  //       Authorization: `Bearer ${getToken(subject, plant, permissions)}`,
  //       "Content-Type": "application/json"
  //     }
  //   })
  //     .then(response => {
  //       resolve(response.data)
  //     })
  //     .catch(err => {
  //       reject(err)
  //     })
  // })
  const response = await retryableRequest({requestConfig, retryConfig, log, makeRequest: getAxiosRequest})
}

export const createDeviceModelMapping = async appContext => {
  const deviceProperties = await getDeviceProperties(appContext)
  return deviceProperties.reduce((acc, deviceProperty) => {
    acc[deviceProperty.device] = deviceProperty.model
    return acc
  }, {})
}
