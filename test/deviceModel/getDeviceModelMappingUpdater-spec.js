import nock from "nock"
import {
  mockDeviceRegistryPutFailureResponse,
  mockDeviceRegistryPutSuccessResponse
} from "../utils/mockDeviceRegistryResponse"
import {getDeviceModelMappingUpdater} from "../../src/deviceModel/getDeviceModelMappingUpdater"
import {clearEnv} from "../utils"
import {getMockLog} from "../stubs/logger"
import {clearStub} from "../stubs/clearStub"

describe("Update device mapping", () => {
  const {env} = process
  const url = "https://svc-device-registry.com/device-registry"
  const endpoint = "/devices"
  let log
  let appContext
  beforeEach(() => {
    nock.cleanAll()
    log = getMockLog()
    appContext = {
      apiConfig: {
        plant: "ather",
        deviceRegistryUrl: `${url}${endpoint}`
      },
      log
    }
    env.VI_ATHER_COLLECTOR_MAX_RETRIES = 2
    env.VI_ATHER_COLLECTOR_RETRY_DELAY = 100
    env.VI_ATHER_COLLECTOR_RETRY_LOG_THRESHOLD = 1
    env.VI_JWT = "dummysecret"
    env.VI_VALUE_KEY = "value"
    env.VI_DATAITEM_MODEL_LIST = "bike_type,model"
  })

  afterEach(() => {
    clearEnv()
    clearStub()
  })

  it("update devices mapping on receiving new device with value in gen_model format", async () => {
    const putRequestBody = {model: "450plus"}
    const deviceModelMapping = {"device-1": "450x", "device-2": "450plus"}

    const event = {device_uuid: "device-5", value: "GEN2_450plus", data_item_name: "bike_type"}
    const putUrl = `${endpoint}/${event.device_uuid}`
    mockDeviceRegistryPutSuccessResponse(url, putUrl, putRequestBody, putRequestBody)
    const updateDeviceModelMapping = await getDeviceModelMappingUpdater(appContext)
    const response = await updateDeviceModelMapping(deviceModelMapping, event)
    expect(response).to.eql({
      "device-1": "450x",
      "device-2": "450plus",
      "device-5": "450plus"
    })
  })

  it("update devices mapping on receiving new device with value in model format", async () => {
    const putRequestBody = {model: "450plus"}
    const deviceModelMapping = {"device-1": "450x", "device-2": "450plus"}

    const event = {device_uuid: "device-5", value: "450plus", data_item_name: "model"}
    const putUrl = `${endpoint}/${event.device_uuid}`
    mockDeviceRegistryPutSuccessResponse(url, putUrl, putRequestBody, putRequestBody)
    const updateDeviceModelMapping = await getDeviceModelMappingUpdater(appContext)
    const response = await updateDeviceModelMapping(deviceModelMapping, event)
    expect(response).to.eql({
      "device-1": "450x",
      "device-2": "450plus",
      "device-5": "450plus"
    })
  })

  it("should not update device model mapping when a new device comes but model is invalid", async () => {
    const putRequestBody = {model: "450plus"}
    const deviceModelMapping = {"device-1": "450x", "device-2": "450plus"}

    const event = {device_uuid: "device-5", data_item_name: "bike_type"}
    const putUrl = `${endpoint}/${event.device_uuid}`
    mockDeviceRegistryPutSuccessResponse(url, putUrl, putRequestBody, putRequestBody)
    const updateDeviceModelMapping = await getDeviceModelMappingUpdater(appContext)
    const response = await updateDeviceModelMapping(deviceModelMapping, event)
    expect(response).to.eql({
      "device-1": "450x",
      "device-2": "450plus"
    })
  })

  it("update devices mapping when device exists and model changes", async () => {
    const putRequestBody = {model: "450plus"}
    const deviceModelMapping = {"device-1": "450x", "device-5": "450"}

    const event = {device_uuid: "device-5", value: "GEN2_450plus", data_item_name: "bike_type"}
    const putUrl = `${endpoint}/${event.device_uuid}`
    mockDeviceRegistryPutSuccessResponse(url, putUrl, putRequestBody, putRequestBody)
    const updateDeviceModelMapping = await getDeviceModelMappingUpdater(appContext)
    const response = await updateDeviceModelMapping(deviceModelMapping, event)
    expect(response).to.eql({
      "device-1": "450x",
      "device-5": "450plus"
    })
  })

  it("should not update devices mapping when device exists and model changes to invalid", async () => {
    const putRequestBody = {model: "450plus"}
    const deviceModelMapping = {"device-1": "450x", "device-5": "450"}

    const event = {device_uuid: "device-5", data_item_name: "bike_type"}
    const putUrl = `${endpoint}/${event.device_uuid}`
    mockDeviceRegistryPutSuccessResponse(url, putUrl, putRequestBody, putRequestBody)
    const updateDeviceModelMapping = await getDeviceModelMappingUpdater(appContext)
    const response = await updateDeviceModelMapping(deviceModelMapping, event)
    expect(response).to.eql({
      "device-1": "450x",
      "device-5": "450"
    })
  })

  it("do not update if existing device model mapping for device is correct", async () => {
    // no mock response as no api request is made
    const deviceModelMapping = {"device-1": "450x", "device-5": "450"}
    const event = {device_uuid: "device-5", value: "GEN2_450", data_item_name: "bike_type"}
    const updateDeviceModelMapping = await getDeviceModelMappingUpdater(appContext)
    const response = await updateDeviceModelMapping(deviceModelMapping, event)
    expect(response).to.eql({
      "device-1": "450x",
      "device-5": "450"
    })
  })

  it("should not retry on non retryable error and should not update deviceModel", async () => {
    const putRequestBody = {model: "450"}
    const deviceModelMapping = {"device-1": "450x"}
    const event = {device_uuid: "device-6", value: "GEN2_450", data_item_name: "bike_type"}
    const putUrl = `${endpoint}/${event.device_uuid}`
    mockDeviceRegistryPutFailureResponse(url, putUrl, putRequestBody, 400, 1, {})
    const updateDeviceModelMapping = await getDeviceModelMappingUpdater(appContext)
    const response = await updateDeviceModelMapping(deviceModelMapping, event)
    expect(response).to.eql(deviceModelMapping)
    expect(log.warn).to.have.been.calledOnce
  })

  it("should retry when retryConfig is set non zero", async () => {
    const putRequestBody = {model: "450"}
    const deviceModelMapping = {"device-1": "450x"}

    const event = {device_uuid: "device-6", value: "GEN2_450", data_item_name: "bike_type"}
    const putUrl = `${endpoint}/${event.device_uuid}`
    mockDeviceRegistryPutFailureResponse(url, putUrl, putRequestBody, 503, 1, {})
    const updateDeviceModelMapping = await getDeviceModelMappingUpdater(appContext)
    const response = await updateDeviceModelMapping(deviceModelMapping, event)
    expect(response).to.eql({
      "device-1": "450x",
      "device-6": "450"
    })
    expect(log.warn).to.have.been.calledOnce
  })

  it("should retry and log error on retry caps out", async () => {
    const putRequestBody = {model: "450"}
    const deviceModelMapping = {"device-1": "450x"}

    const event = {device_uuid: "device-6", value: "GEN2_450", data_item_name: "bike_type"}
    const putUrl = `${endpoint}/${event.device_uuid}`
    mockDeviceRegistryPutFailureResponse(url, putUrl, putRequestBody, 503, 3, {})
    const updateDeviceModelMapping = await getDeviceModelMappingUpdater(appContext)
    const response = await updateDeviceModelMapping(deviceModelMapping, event)
    expect(response).to.eql({
      "device-1": "450x"
    })
    expect(log.warn).to.have.been.calledThrice
    expect(log.error).to.have.been.calledOnce
  })
})
