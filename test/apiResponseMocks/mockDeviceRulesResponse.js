import nock from "nock"

export const mockDeviceRulesPutSuccess = (baseUrl, putUrl, requestBody) => {
  return nock(baseUrl).put(putUrl, requestBody).reply(200, "ok")
}

export const mockDeviceRulesPutSuccessAfterFailure = (baseUrl, putUrl, requestBody, failureStatusCode, numFailures) => {
  return nock(baseUrl)
    .put(putUrl, requestBody)
    .times(numFailures)
    .replyWithError({message: "Server error", statusCode: failureStatusCode})
    .put(putUrl, requestBody)
    .reply(200, "ok")
}
