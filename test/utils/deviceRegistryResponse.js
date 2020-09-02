import nock from "nock"

export const mockDeviceRegistrySuccessResponse = (baseUrl, postUrl, requestBody, response) => {
  return nock(baseUrl).post(postUrl, requestBody).reply(200, response)
}
