import nock from "nock";

export const mockDeviceRegistrySuccessResponse = (device, url) =>
  nock(url)
    .post(endpoint, {
      devices: [device],
    })
    .reply(200, {
      "device": "device123"
    })
