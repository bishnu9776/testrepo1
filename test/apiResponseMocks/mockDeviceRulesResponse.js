import nock from "nock"

export const mockDeviceRulesPutSuccess = ({baseUrl, putUrl}) => {
  return nock(baseUrl).put(putUrl).reply(200, "ok")
}

export const mockDeviceRulesPutSuccessAfterFailure = ({baseUrl, putUrl, failureStatusCode, numFailures}) => {
  return nock(baseUrl)
    .put(putUrl)
    .times(numFailures)
    .replyWithError({message: "Server error", statusCode: failureStatusCode})
    .put(putUrl)
    .reply(200, "ok")
}

export const mockDeviceRulesPutFailure = ({baseUrl, putUrl, failureStatusCode}) => {
  return nock(baseUrl).put(putUrl).replyWithError({message: "Server error", statusCode: failureStatusCode})
}
