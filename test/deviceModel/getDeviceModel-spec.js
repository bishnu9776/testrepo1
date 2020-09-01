import nock from "nock"
import {getDeviceModel} from "../../src/deviceModel/getDeviceModel"
import {mockDeviceRegistrySuccessResponse} from "../utils/deviceRegistryResponse";
// import getTokenStub from "../stubs/getTokenStub"

describe("Get metrics", () => {
  const subject = "test-ather-metrics-publisher"
  const permissions = ["report1:read", "report2:read"]
  const url = "https://svc-device-registry.com/device-registry"
  const endpoint = "/devices"
  const {env} = process
  // const getToken = getTokenStub()

  beforeEach(() => {
    nock.cleanAll()
    env.VI_SVC_DEVICE_REGISTRY_URL = `${url}${endpoint}`
    env.VI_JWT_LIFETIME_SECS = "86400"
    env.VI_JWT_ALGORITHM = "HS256"
    env.VI_SVC_ATHER_METRICS_PERMISSIONS = "reports:read"
    env.VI_RETRY_LOG_THRESHOLD = "5"
    env.VI_JWT_SECS_BEFORE_EXPIRY_TO_DECIDE_TO_REFRESH_TOKEN = "300"
    env.VI_JWT_SECRET = "testing"
  })

  it("get devices", async () => {
    const res = mockDeviceRegistrySuccessResponse(url, endpoint, "device-1")
    console.log("Mock", res)
    const response = await getDeviceModel()
    console.log(response)
  })
})
