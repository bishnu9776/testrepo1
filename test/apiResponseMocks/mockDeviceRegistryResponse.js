import nock from "nock"

export const mockDeviceRegistryPostSuccessResponse = (baseUrl, postUrl, response) => {
  return nock(baseUrl)
    .post(postUrl, {fields: ["model", "device"]})
    .reply(200, response)
}

export const mockDeviceRegistryPostSuccessAfterFailure = (
  baseUrl,
  postUrl,
  response,
  numFailures,
  failureStatusCode
) => {
  return nock(baseUrl)
    .post(postUrl, {fields: ["model", "device"]})
    .times(numFailures)
    .replyWithError({message: "Server error", statusCode: failureStatusCode})
    .post(postUrl)
    .reply(200, response)
}

export const mockDeviceRegistryPutSuccess = (baseUrl, putUrl, requestBody, response) => {
  return nock(baseUrl).put(putUrl, requestBody).reply(200, response)
}

export const mockDeviceRegistryPutFailure = ({baseUrl, putUrl, requestBody, numFailures, failureStatusCode}) => {
  return nock(baseUrl)
    .put(putUrl, requestBody)
    .times(numFailures)
    .replyWithError({message: "Server error", statusCode: failureStatusCode})
}

export const mockDeviceRegistryPutSuccessAfterFailure = (
  baseUrl,
  putUrl,
  requestBody,
  failureStatusCode,
  numFailures,
  response
) => {
  return nock(baseUrl)
    .put(putUrl, requestBody)
    .times(numFailures)
    .replyWithError({message: "Server error", statusCode: failureStatusCode})
    .put(putUrl, requestBody)
    .reply(200, response)
}
