import nock from "nock"

export const mockDeviceRegistryPostSuccessResponse = (baseUrl, postUrl, response) => {
  return nock(baseUrl)
    .post(postUrl, {fields: ["model", "device"]})
    .reply(200, response)
}

export const mockDeviceRegistryPostSuccessAfterFailure = (baseUrl, postUrl, response, numFailures, statusCode) => {
  return nock(baseUrl)
    .post(postUrl, {fields: ["model", "device"]})
    .times(numFailures)
    .replyWithError({message: "Server error", statusCode})
    .post(postUrl)
    .reply(200, response)
}

export const mockDeviceRegistryPutSuccessResponse = (baseUrl, putUrl, requestBody, response, numSuccesses = 100) => {
  return nock(baseUrl).put(putUrl, requestBody).times(numSuccesses).reply(200, response)
}

export const mockDeviceRegistryPutFailureResponse = (
  baseUrl,
  putUrl,
  requestBody,
  statusCode,
  numFailures,
  response
) => {
  return nock(baseUrl)
    .put(putUrl, requestBody)
    .times(numFailures)
    .replyWithError({message: "Server error", statusCode})
    .put(putUrl, requestBody)
    .reply(200, response)
}
