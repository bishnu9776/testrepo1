import nock from "nock"
import {createDeviceModelMapping, getDeviceProperties} from "../../src/deviceModel/getDeviceProperties"
import {mockDeviceRegistryPostSuccessResponse} from "../utils/deviceRegistryResponse"
import {getTokenStub} from "../stubs/getTokenStub"

describe("create device Model Mapping", () => {
  const url = "https://svc-device-registry.com/device-registry"
  const endpoint = "/devices"
  const getToken = getTokenStub()
  const apiConfig = {
    plant: "ather",
    url: `${url}${endpoint}`,
    subject: "svc-ather-collector",
    permissions: ["reports:read"]
  }

  beforeEach(() => {
    nock.cleanAll()
  })

  it("get devices", async () => {
    const requestBody = {}
    const response = {device: "device-1", plant: "ather", model: "450x"}
    mockDeviceRegistryPostSuccessResponse(url, endpoint, requestBody, response)
    const devices = await getDeviceProperties({apiConfig, getToken})
    expect(devices).to.eql(response)
  })

  it("create devices mapping", async () => {
    const requestBody = {}
    const response = [
      {device: "device-1", plant: "ather", model: "450x"},
      {device: "device-2", plant: "ather", model: "450plus"}
    ]
    mockDeviceRegistryPostSuccessResponse(url, endpoint, requestBody, response)
    const deviceMapping = await createDeviceModelMapping({apiConfig, getToken})
    expect(deviceMapping).to.eql({"device-1": "450x", "device-2": "450plus"})
  })
})
