import nock from "nock"
import {fetchDeviceModelMapping} from "../../src/deviceModel/fetchDeviceModelMapping"
import {
  mockDeviceRegistryPostSuccessAfterFailure,
  mockDeviceRegistryPostSuccessResponse
} from "../apiResponseMocks/mockDeviceRegistryResponse"
import {getMockLog} from "../stubs/logger"
import {clearEnv} from "../utils"
import {clearStub} from "../stubs/clearStub"

describe("create device Model Mapping", () => {
  const {env} = process
  const url = "https://svc-device-registry.com/device-registry"
  const endpoint = "/devices"
  let log

  beforeEach(() => {
    log = getMockLog()
    env.VI_ATHER_COLLECTOR_MAX_RETRIES = 2
    env.VI_ATHER_COLLECTOR_RETRY_DELAY = 100
    env.VI_ATHER_COLLECTOR_RETRY_LOG_THRESHOLD = 1
    env.VI_JWT = "dummysecret"
    env.VI_DEVICE_REGISTRY_DEVICES_URL = "https://svc-device-registry.com/device-registry/devices"
    env.VI_PLANT = "ather"
  })

  afterEach(() => {
    clearEnv()
    clearStub()
    nock.cleanAll()
  })

  it("fetches devices mapping", async () => {
    const response = [
      {device: "device-1", model: "A"},
      {device: "device-2", model: "B"}
    ]
    mockDeviceRegistryPostSuccessResponse(url, endpoint, response)
    const deviceMapping = await fetchDeviceModelMapping({log})
    expect(deviceMapping).to.eql({"device-1": "A", "device-2": "B"})
  })

  it("should not retry on non retryable error", async () => {
    env.VI_ATHER_COLLECTOR_RETRY_LOG_THRESHOLD = 3
    const response = [
      {device: "device-a", model: "A"},
      {device: "device-b", model: "B"}
    ]
    mockDeviceRegistryPostSuccessAfterFailure(url, endpoint, response, 1, 400)
    const deviceMapping = await fetchDeviceModelMapping({log})
    expect(deviceMapping).to.eql({})
    expect(log.warn).to.have.been.calledOnce
  })

  it("retry on post request retryable 5xx error", async () => {
    const response = [
      {device: "device-a", model: "A"},
      {device: "device-b", model: "B"}
    ]
    mockDeviceRegistryPostSuccessAfterFailure(url, endpoint, response, 1, 503)
    const deviceMapping = await fetchDeviceModelMapping({log})
    expect(deviceMapping).to.eql({"device-a": "A", "device-b": "B"})
    expect(log.warn).to.have.been.calledOnce
  })

  it("log error and return on retry cap out", async () => {
    const response = [
      {device: "device-a", model: "Z"},
      {device: "device-b", model: "A"}
    ]
    mockDeviceRegistryPostSuccessAfterFailure(url, endpoint, response, 3, 503)
    const deviceMapping = await fetchDeviceModelMapping({log})
    expect(deviceMapping).to.eql({})
    expect(log.warn).to.have.been.calledThrice
    expect(log.error).to.have.been.calledOnce
  })
})
