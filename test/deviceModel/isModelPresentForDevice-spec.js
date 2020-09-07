import {isModelPresentForDevice} from "../../src/deviceModel/isModelPresentForDevice"
import {clearEnv} from "../utils"
import {getMockLog} from "../stubs/logger"

describe("IsModelDevicePresent", () => {
  const deviceModelMapping = {
    "device-1": "m-1",
    "device-3": "m-10",
    "device-5": "m-3"
  }
  let log

  beforeEach(() => {
    process.env.VI_SHOULD_DROP_EVENTS_FOR_DEVICE_WITHOUT_MODEL = "true"
    log = getMockLog()
  })

  afterEach(() => {
    clearEnv()
  })

  it("should return true for messages with tag ack", () => {
    const isModelDeviceMappingPresent = isModelPresentForDevice({deviceModelMapping, log})
    const event = {message: "a", tag: "ack"}
    expect(isModelDeviceMappingPresent(event)).to.be.true
  })

  it("should return true for devices which has model present in the device model mapping", () => {
    const isModelDeviceMappingPresent = isModelPresentForDevice({deviceModelMapping, log})
    const event = {device_uuid: "device-1", data_item_name: "foo", value: "bar"}
    expect(isModelDeviceMappingPresent(event)).to.be.true
  })

  it("should return false for devices which are absent in device model mapping", () => {
    const isModelDeviceMappingPresent = isModelPresentForDevice({deviceModelMapping, log})
    const event = {device_uuid: "device-10", data_item_name: "foo", value: "bar"}
    expect(isModelDeviceMappingPresent(event)).to.be.false
  })

  it("should return true when shouldDropEventsForDeviceWithoutModel is set as false", () => {
    process.env.VI_SHOULD_DROP_EVENTS_FOR_DEVICE_WITHOUT_MODEL = "false"
    const isModelDeviceMappingPresent = isModelPresentForDevice({deviceModelMapping, log})
    const event = {device_uuid: "device-10", data_item_name: "foo", value: "bar"}
    expect(isModelDeviceMappingPresent(event)).to.be.true
  })
})
