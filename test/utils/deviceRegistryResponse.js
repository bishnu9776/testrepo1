import nock from "nock"

export const mockDeviceRegistryPostSuccessResponse = (baseUrl, postUrl, requestBody, response) => {
  return nock(baseUrl).post(postUrl, requestBody).reply(200, response)
}

export const mockDeviceRegistryPutSuccessResponse = (baseUrl, putUrl, requestBody, response) => {
  return nock(baseUrl).put(putUrl, requestBody).reply(200, response)
}

export const mockDeviceRegistryPutFailureResponse = (baseUrl, putUrl, requestBody) => {
  return nock(baseUrl).put(putUrl, requestBody).reply(400)
}
