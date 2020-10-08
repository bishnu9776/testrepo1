import nock from "nock"

export const mockDeviceRulesPutSuccess = ({baseUrl, putUrl, numSuccesses = 100}) => {
  if (numSuccesses === 0) {
    return nock(baseUrl).put(putUrl).replyWithError({message: "Server error", statusCode: 400})
  }
  return nock(baseUrl).put(putUrl).times(numSuccesses).reply(200, "ok")
}

export const mockDeviceRulesGetSuccess = ({baseUrl, getUrl, response}) => {
  return nock(baseUrl).get(getUrl).reply(200, response)
}
