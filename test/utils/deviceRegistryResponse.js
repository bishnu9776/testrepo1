import nock from "nock"

export const mockDeviceRegistrySuccessResponse = (url, endpoint, device) =>
  nock(url).post(endpoint, {}).reply(200, {
    device: "device123"
  })
