import nock from "nock"
import {createDeviceModelMapping, getDeviceProperties} from "../../src/deviceModel/getDeviceProperties"
import {
  mockDeviceRegistryPostSuccessAfterFailure,
  mockDeviceRegistryPostSuccessResponse
} from "../utils/deviceRegistryResponse"
import {getTokenStub} from "../stubs/getTokenStub"
import {getMockLog} from "../stubs/logger"
import {clearEnv} from "../utils"
import {clearStub} from "../stubs/clearStub"

describe("create device Model Mapping", () => {
  const {env} = process
  const url = "https://svc-device-registry.com/device-registry"
  const endpoint = "/devices"
  let getToken
  let log
  const apiConfig = {
    plant: "test",
    url: `${url}${endpoint}`,
    subject: "svc-ather-collector",
    permissions: ["reports:read"]
  }

  beforeEach(() => {
    getToken = getTokenStub()
    log = getMockLog()
    nock.cleanAll()
    env.VI_ATHER_COLLECTOR_MAX_RETRIES = 2
    env.VI_ATHER_COLLECTOR_RETRY_DELAY = 100
    env.VI_ATHER_COLLECTOR_RETRY_LOG_THRESHOLD = 1
  })

  afterEach(() => {
    clearEnv()
    clearStub()
  })

  it("get devices", async () => {
    const expected = {device: "device-1", model: "A"}
    mockDeviceRegistryPostSuccessResponse(url, endpoint, expected)
    const {response} = await getDeviceProperties({apiConfig, getToken, log})
    expect(response.data).to.eql(expected)
  })

  it("create devices mapping", async () => {
    const response = [
      {device: "device-1", model: "A"},
      {device: "device-2", model: "B"}
    ]
    mockDeviceRegistryPostSuccessResponse(url, endpoint, response)
    const deviceMapping = await createDeviceModelMapping({apiConfig, getToken, log})
    expect(deviceMapping).to.eql({"device-1": "A", "device-2": "B"})
  })

  it("should not retry on non retryable error", async () => {
    env.VI_ATHER_COLLECTOR_RETRY_LOG_THRESHOLD = 3
    const response = [
      {device: "device-a", model: "A"},
      {device: "device-b", model: "B"}
    ]
    mockDeviceRegistryPostSuccessAfterFailure(url, endpoint, response, 1, 400)
    const deviceMapping = await createDeviceModelMapping({apiConfig, getToken, log})
    expect(deviceMapping).to.eql({})
    expect(log.warn).to.have.been.calledOnce
  })

  it("retry on post request retryable 5xx error", async () => {
    const response = [
      {device: "device-a", model: "A"},
      {device: "device-b", model: "B"}
    ]
    mockDeviceRegistryPostSuccessAfterFailure(url, endpoint, response, 1, 503)
    const deviceMapping = await createDeviceModelMapping({apiConfig, getToken, log})
    expect(deviceMapping).to.eql({"device-a": "A", "device-b": "B"})
    expect(log.warn).to.have.been.calledOnce
  })

  it("log error and return on retry cap out", async () => {
    const response = [
      {device: "device-a", model: "Z"},
      {device: "device-b", model: "A"}
    ]
    mockDeviceRegistryPostSuccessAfterFailure(url, endpoint, response, 3, 503)
    const deviceMapping = await createDeviceModelMapping({apiConfig, getToken, log})
    expect(deviceMapping).to.eql({})
    expect(log.warn).to.have.been.calledTwice
    expect(log.error).to.have.been.calledOnce
  })
})
