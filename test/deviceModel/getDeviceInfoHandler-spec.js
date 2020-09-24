/* eslint-disable mocha/no-return-from-async */
import nock from "nock"
import {
  mockDeviceRegistryPostSuccessResponse,
  mockDeviceRegistryPutFailureResponse,
  mockDeviceRegistryPutSuccessResponse
} from "../utils/mockDeviceRegistryResponse"
import {getDeviceInfoHandler} from "../../src/deviceModel/getDeviceInfoHandler"
import {clearEnv} from "../utils"
import {getMockLog} from "../stubs/logger"
import {clearStub} from "../stubs/clearStub"

describe("Update device info", () => {
  const {env} = process
  const deviceRegistryUrl = "https://svc-device-registry.com/device-registry"
  const endpoint = "/devices"
  const deviceRulesUrl = "https://svc-device-rules.com/rules/device/"
  let log
  let appContext
  beforeEach(() => {
    nock.cleanAll()
    log = getMockLog()
    appContext = {
      apiConfig: {
        plant: "ather",
        deviceRegistryUrl: `${deviceRegistryUrl}${endpoint}`,
        deviceRulesUrl
      },
      log
    }
    env.VI_ATHER_COLLECTOR_MAX_RETRIES = 2
    env.VI_ATHER_COLLECTOR_RETRY_DELAY = 100
    env.VI_ATHER_COLLECTOR_RETRY_LOG_THRESHOLD = 1
    env.VI_JWT = "dummysecret"
    env.VI_VALUE_KEY = "value"
    env.VI_DATAITEM_MODEL_LIST = "bike_type,model"
    env.VI_PLANT = "ather"
    env.VI_DEVICE_REGISTRY_DEVICES_URL = "https://svc-device-registry.com/device-registry/devices" // TODO: Update nock to use only url instead of url + endpoint
  })

  afterEach(() => {
    clearEnv()
    clearStub()
  })

  describe("Combination scenarios between updates to device model and updates to device rules", () => {
    it("updates rules and device model if both APIs are up", () => {})

    it("does not update external device model and in-memory device model if rule update API fails", () => {})

    it("retries both updating device rules and devide model if device registry API fails", () => {})
  })

  describe("Updates to device model", () => {
    it("update devices mapping on receiving new device with value in gen_model format", async () => {
      mockDeviceRegistryPostSuccessResponse("https://svc-device-registry.com/device-registry", "/devices", [])
      const putRequestBody1 = {model: "450plus"}
      const putRequestBody2 = {model: "450x"}
      const events = [
        {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type"},
        {device_uuid: "device-2", value: "GEN2_450x", data_item_name: "bike_type"},
        {device_uuid: "device-3", value: "GEN2_450x", data_item_name: "bike_type"}
      ]
      mockDeviceRegistryPutSuccessResponse(
        deviceRegistryUrl,
        `${endpoint}/${events[0].device_uuid}`,
        putRequestBody1,
        "ok"
      )
      mockDeviceRegistryPutSuccessResponse(
        deviceRegistryUrl,
        `${endpoint}/${events[1].device_uuid}`,
        putRequestBody2,
        "ok"
      )
      mockDeviceRegistryPutSuccessResponse(
        deviceRegistryUrl,
        `${endpoint}/${events[2].device_uuid}`,
        putRequestBody2,
        "ok"
      )

      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
      return Promise.all(events.map(updateDeviceInfo)).then(() => {
        expect(getUpdatedDeviceModelMapping()).to.eql({
          "device-1": "450plus",
          "device-2": "450x",
          "device-3": "450x"
        })
      })
    })

    it("update devices mapping on receiving new device with value in model format", async () => {
      mockDeviceRegistryPostSuccessResponse("https://svc-device-registry.com/device-registry", "/devices", [])
      const putRequestBody = {model: "450plus"}
      const events = [
        {device_uuid: "device-1", value: "450plus", data_item_name: "bike_type"},
        {device_uuid: "device-2", value: "450x", data_item_name: "bike_type"}
      ]
      mockDeviceRegistryPutSuccessResponse(
        deviceRegistryUrl,
        `${endpoint}/${events[0].device_uuid}`,
        putRequestBody,
        "ok"
      )
      mockDeviceRegistryPutSuccessResponse(
        deviceRegistryUrl,
        `${endpoint}/${events[1].device_uuid}`,
        {model: "450x"},
        "ok"
      )
      const event = {device_uuid: "device-5", value: "450plus", data_item_name: "model"}
      const putUrl = `${endpoint}/${event.device_uuid}`
      mockDeviceRegistryPutSuccessResponse(deviceRegistryUrl, putUrl, putRequestBody, putRequestBody)
      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)

      return Promise.all(events.map(updateDeviceInfo)).then(() => {
        expect(getUpdatedDeviceModelMapping()).to.eql({
          "device-1": "450plus",
          "device-2": "450x"
        })
      })
    })

    it("should not update device model mapping when a new device comes but model is invalid", async () => {
      mockDeviceRegistryPostSuccessResponse("https://svc-device-registry.com/device-registry", "/devices", [])
      const putRequestBody = {model: "450plus"}
      const events = [
        {device_uuid: "device-1", value: "450plus", data_item_name: "bike_type"},
        {device_uuid: "device-1", data_item_name: "bike_type"}
      ]

      mockDeviceRegistryPutSuccessResponse(
        deviceRegistryUrl,
        `${endpoint}/${events[0].device_uuid}`,
        putRequestBody,
        "ok"
      )

      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
      return Promise.all(events.map(updateDeviceInfo)).then(() => {
        expect(getUpdatedDeviceModelMapping()).to.eql({
          "device-1": "450plus"
        })
      })
    })

    it("update devices mapping when device exists and model changes", async () => {
      mockDeviceRegistryPostSuccessResponse("https://svc-device-registry.com/device-registry", "/devices", [])
      const events = [
        {device_uuid: "device-1", value: "450plus", data_item_name: "bike_type"},
        {device_uuid: "device-1", value: "450x", data_item_name: "bike_type"}
      ]
      mockDeviceRegistryPutSuccessResponse(
        deviceRegistryUrl,
        `${endpoint}/${events[0].device_uuid}`,
        {model: "450plus"},
        "ok"
      )
      mockDeviceRegistryPutSuccessResponse(
        deviceRegistryUrl,
        `${endpoint}/${events[0].device_uuid}`,
        {model: "450x"},
        "ok"
      )
      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)

      return Promise.all(events.map(updateDeviceInfo)).then(() => {
        expect(getUpdatedDeviceModelMapping()).to.eql({
          "device-1": "450x"
        })
      })
    })

    it("should not update devices mapping when device exists and model changes to invalid", async () => {
      mockDeviceRegistryPostSuccessResponse("https://svc-device-registry.com/device-registry", "/devices", [])
      const putRequestBody = {model: "450plus"}
      const events = [
        {device_uuid: "device-1", value: "450plus", data_item_name: "bike_type"},
        {device_uuid: "device-1", data_item_name: "bike_type"}
      ]
      mockDeviceRegistryPutSuccessResponse(
        deviceRegistryUrl,
        `${endpoint}/${events[0].device_uuid}`,
        putRequestBody,
        "ok"
      )
      const event = {device_uuid: "device-5", value: "450plus", data_item_name: "model"}
      const putUrl = `${endpoint}/${event.device_uuid}`
      mockDeviceRegistryPutSuccessResponse(deviceRegistryUrl, putUrl, putRequestBody, putRequestBody)
      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)

      // eslint-disable-next-line sonarjs/no-identical-functions
      return Promise.all(events.map(updateDeviceInfo)).then(() => {
        expect(getUpdatedDeviceModelMapping()).to.eql({
          "device-1": "450plus"
        })
      })
    })

    it("update device model only once if device model mapping is already correct", async () => {
      mockDeviceRegistryPostSuccessResponse("https://svc-device-registry.com/device-registry", "/devices", [])
      const putRequestBody = {model: "450plus"}
      const events = [
        {device_uuid: "device-1", value: "450plus", data_item_name: "bike_type"},
        {device_uuid: "device-1", value: "450plus", data_item_name: "bike_type"}
      ]
      mockDeviceRegistryPutFailureResponse(
        deviceRegistryUrl,
        `${endpoint}/${events[0].device_uuid}`,
        putRequestBody,
        400,
        1,
        "ok"
      )
      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)

      return Promise.all(events.map(updateDeviceInfo)).then(() => {
        expect(getUpdatedDeviceModelMapping()).to.eql({
          "device-1": "450plus"
        })
        expect(log.warn).to.have.been.calledOnce
      })
    })

    it("should not retry on non retryable error and should not update deviceModel", async () => {
      mockDeviceRegistryPostSuccessResponse("https://svc-device-registry.com/device-registry", "/devices", [])
      const putRequestBody = {model: "450"}
      const event = {device_uuid: "device-6", value: "GEN2_450", data_item_name: "bike_type"}
      const putUrl = `${endpoint}/${event.device_uuid}`
      mockDeviceRegistryPutFailureResponse(deviceRegistryUrl, putUrl, putRequestBody, 400, 1, {})
      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
      await updateDeviceInfo(event)
      expect(getUpdatedDeviceModelMapping()).to.eql({})
      expect(log.warn).to.have.been.calledOnce
    })

    it("should retry when retry config has non-zero retries", async () => {
      mockDeviceRegistryPostSuccessResponse("https://svc-device-registry.com/device-registry", "/devices", [])
      const putRequestBody = {model: "450"}

      const event = {device_uuid: "device-1", value: "GEN2_450", data_item_name: "bike_type"}
      const putUrl = `${endpoint}/${event.device_uuid}`
      mockDeviceRegistryPutFailureResponse(deviceRegistryUrl, putUrl, putRequestBody, 503, 2, {})
      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
      await updateDeviceInfo(event)
      expect(log.warn).to.have.been.calledTwice
      expect(getUpdatedDeviceModelMapping()).to.eql({"device-1": "450"})
    })

    it("should retry and log error on retry caps out", async () => {
      mockDeviceRegistryPostSuccessResponse("https://svc-device-registry.com/device-registry", "/devices", [])
      const putRequestBody = {model: "450"}

      const event = {device_uuid: "device-1", value: "GEN2_450", data_item_name: "bike_type"}
      const putUrl = `${endpoint}/${event.device_uuid}`
      mockDeviceRegistryPutFailureResponse(deviceRegistryUrl, putUrl, putRequestBody, 503, 3, {})
      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
      await updateDeviceInfo(event)
      expect(log.warn).to.have.been.calledThrice
      expect(log.error).to.have.been.calledOnce
      expect(getUpdatedDeviceModelMapping()).to.eql({})
    })

    it("do not update if existing device model mapping for device is correct", async () => {
      // Not mocking PUT request as we won't send updates since device registry is up to date
      mockDeviceRegistryPostSuccessResponse("https://svc-device-registry.com/device-registry", "/devices", [
        {device: "device-1", model: "450"},
        {device: "device-2", model: "450x"}
      ])

      const events = [
        {device_uuid: "device-1", value: "GEN2_450", data_item_name: "bike_type"},
        {device_uuid: "device-2", value: "GEN2_45x", data_item_name: "bike_type"}
      ]

      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
      return Promise.all(events.map(updateDeviceInfo)).then(() => {
        expect(getUpdatedDeviceModelMapping()).to.eql({
          "device-1": "450",
          "device-2": "450x"
        })
      })
    })
  })
})
