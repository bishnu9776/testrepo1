import nock from "nock"

export const mockDeviceRegistryPostSuccessResponse = (baseUrl, postUrl, response) => {
  return nock(baseUrl).post(postUrl, {}).reply(200, response)
}

export const mockDeviceRegistryPostSuccessAfterFailure = (baseUrl, postUrl, response, numFailures) => {
  return nock(baseUrl)
    .post(postUrl, {})
    .times(numFailures)
    .replyWithError({message: "Server error", statusCode: 503})
    .post(postUrl)
    .reply(200, response)
}

export const mockDeviceRegistryPutSuccessResponse = (baseUrl, putUrl, requestBody, response) => {
  return nock(baseUrl).put(putUrl, requestBody).reply(200, response)
}

export const mockDeviceRegistryPutFailureResponse = (baseUrl, putUrl, requestBody) => {
  return nock(baseUrl).put(putUrl, requestBody).reply(400)
}
