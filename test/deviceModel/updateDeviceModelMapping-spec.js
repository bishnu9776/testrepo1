import nock from "nock"
import {
  mockDeviceRegistryPutFailureResponse,
  mockDeviceRegistryPutSuccessResponse
} from "../utils/deviceRegistryResponse"
import {getUpdateDeviceModelMapping} from "../../src/deviceModel/getUpdateDeviceModelMapping"
import {clearEnv} from "../utils"

describe("Update device mapping", () => {
  const url = "https://svc-device-registry.com/device-registry"
  const endpoint = "/devices"
  const {env} = process

  describe("Device Mapping on Success Response", () => {
    beforeEach(() => {
      nock.cleanAll()
      env.VI_SVC_DEVICE_REGISTRY_URL = `${url}${endpoint}`
      env.VI_JWT_LIFETIME_SECS = "86400"
      env.VI_JWT_ALGORITHM = "HS256"
      env.VI_SVC_ATHER_COLLECTOR_PERMISSIONS = "reports:read"
      env.VI_RETRY_LOG_THRESHOLD = "5"
      env.VI_JWT_SECS_BEFORE_EXPIRY_TO_DECIDE_TO_REFRESH_TOKEN = "300"
      env.VI_JWT_SECRET = "testing"
    })

    afterEach(() => {
      clearEnv()
    })

    it("update devices mapping on receiving new device", async () => {
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

    it("update devices mapping when device exists and model changes", async () => {
      const putRequestBody = {device: "device-5", plant: "ather", model: "450plus"}
      const deviceModelMapping = {"device-1": "450x", "device-5": "450"}

      const event = {device_uuid: "device-5", value: "GEN2_450plus", data_item_name: "bike_type"}
      const putUrl = `${endpoint}/${event.device_uuid}`
      mockDeviceRegistryPutSuccessResponse(url, putUrl, putRequestBody, putRequestBody)
      const putResponse = await getUpdateDeviceModelMapping(deviceModelMapping, event)
      expect(putResponse).to.eql({
        "device-1": "450x",
        "device-5": "450plus"
      })
    })

    it("Do not update if existing device model mapping for device is correct", async () => {
      // no mock response as no api request is made
      const deviceModelMapping = {"device-1": "450x", "device-5": "450"}
      const event = {device_uuid: "device-5", value: "GEN2_450", data_item_name: "bike_type"}
      const putResponse = await getUpdateDeviceModelMapping(deviceModelMapping, event)
      expect(putResponse).to.eql({
        "device-1": "450x",
        "device-5": "450"
      })
    })
  })
  describe.skip("Device mapping on failure response", () => {
    // eslint-disable-next-line sonarjs/no-identical-functions
    beforeEach(() => {
      nock.cleanAll()
      env.VI_SVC_DEVICE_REGISTRY_URL = `${url}${endpoint}`
      env.VI_JWT_LIFETIME_SECS = "86400"
      env.VI_JWT_ALGORITHM = "HS256"
      env.VI_SVC_ATHER_COLLECTOR_PERMISSIONS = "reports:read"
      env.VI_RETRY_LOG_THRESHOLD = "5"
      env.VI_JWT_SECS_BEFORE_EXPIRY_TO_DECIDE_TO_REFRESH_TOKEN = "300"
      env.VI_JWT_SECRET = "testing"
    })

    afterEach(() => {
      clearEnv()
    })

    it("update devices registry sends failure response ", async () => {
      const putRequestBody = {device: "device-6", plant: "ather", model: "450"}
      const deviceModelMapping = {"device-1": "450x"}

      const event = {device_uuid: "device-6", value: "GEN2_450", data_item_name: "bike_type"}
      const putUrl = `${endpoint}/${event.device_uuid}`
      mockDeviceRegistryPutFailureResponse(url, putUrl, putRequestBody)
      const putResponse = await getUpdateDeviceModelMapping(deviceModelMapping, event)
      expect(putResponse).to.eql({
        "device-1": "450x"
      })
    })
  })
})
