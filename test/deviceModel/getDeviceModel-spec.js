import nock from "nock"
import {createDeviceModelMapping, getDeviceRegistry} from "../../src/deviceModel/getDeviceRegistry"
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
    const response = {device: "device-1", plant: "ather", model: "450x"}
    mockDeviceRegistrySuccessResponse(url, endpoint, requestBody, response)
    const devices = await getDeviceRegistry()
    expect(devices).to.eql(response)
  })

  it("create devices mapping", async () => {
    const requestBody = {plant: "ather"}
    const response = [
      {device: "device-1", plant: "ather", model: "450x"},
      {device: "device-2", plant: "ather", model: "450plus"}
    ]
    mockDeviceRegistrySuccessResponse(url, endpoint, requestBody, response)
    const devices = await createDeviceModelMapping()
    expect(devices).to.eql({"device-1": "450x", "device-2": "450plus"})
  })
})
