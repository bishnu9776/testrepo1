import nock from "nock"
import {getDeviceModel} from "../../src/deviceModel/getDeviceModel"
import {mockDeviceRegistrySuccessResponse} from "../utils/deviceRegistryResponse"

describe("Get metrics", () => {
  const url = "https://svc-device-registry.com/device-registry"
  const endpoint = "/devices"
  const {env} = process

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
    const requestBody = {plant: "ather"}
    const response = {}
    mockDeviceRegistrySuccessResponse(url, endpoint, requestBody, response)
    const devices = await getDeviceModel()
    expect(devices).to.eql(response)
  })
})
