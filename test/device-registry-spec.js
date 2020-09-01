// import nock from "nock"
import {getDeviceModel} from "../src/deviceModel/getDeviceModel";

describe("Get metrics", () => {
  // export const mockDeviceRegistrySuccessResponse = (device) =>
  //   nock(url)
  //     .post(endpoint, {
  //       devices: [device],
  //     })
  //     .reply(200, {
  //       "device": "device123"
  //     })

  it("get devices", async () => {
    const response = await getDeviceModel()
    console.log(response)
  })
})
