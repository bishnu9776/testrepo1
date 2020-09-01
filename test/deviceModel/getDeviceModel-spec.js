import nock from "nock"
import {getDeviceModel} from "../../src/deviceModel/getDeviceModel"

describe("Get metrics", () => {
  const subject = "test-ather-metrics-publisher"
  const permissions = ["report1:read", "report2:read"]
  const url = "https://svc-device-registry.com/device-registry"
  const getToken = getTokenStub()

  beforeEach(() => {
    nock.cleanAll()
  })

  it("get devices", async () => {
    const response = await getDeviceModel()
    console.log(response)
  })
})
