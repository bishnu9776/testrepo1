import nock from "nock"
import {mockDeviceRegistryPutSuccessResponse} from "../utils/deviceRegistryResponse"
import {getUpdateDeviceModelMapping} from "../../src/deviceModel/getUpdateDeviceModelMapping"

describe("Update device mapping", () => {
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

  it("update devices mapping", async () => {
    const putRequestBody = {device: "device-5", plant: "ather", model: "450plus"}
    const deviceModelMapping = {"device-1": "450x", "device-2": "450plus"}

    const event = {device_uuid: "device-5", value: "GEN2_450plus", data_item_name: "bike_type"}
    const putUrl = `${endpoint}/${event.device_uuid}`
    mockDeviceRegistryPutSuccessResponse(url, putUrl, putRequestBody, putRequestBody)
    const putResponse = await getUpdateDeviceModelMapping(deviceModelMapping, event)
    expect(putResponse).to.eql({
      "device-1": "450x",
      "device-2": "450plus",
      "device-5": "450plus"
    })
  })
})
