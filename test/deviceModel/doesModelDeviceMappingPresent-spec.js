import {doesModelDeviceMappingPresent} from "../../src/deviceModel/doesModelDeviceMappingPresent"

describe("IsModelDevicePresent", () => {
  const deviceModelMapping = {
    "device-1": "m-1",
    "device-3": "m-10",
    "device-5": "m-3"
  }
  it("should return true for messages with tag ack", () => {
    const isModelDeviceMappingPresent = doesModelDeviceMappingPresent(deviceModelMapping)
    const event = {message: "a", tag: "ack"}
    expect(isModelDeviceMappingPresent(event)).to.be.true
  })

  it("should return true for devices which has model present in the device model mapping", () => {
    const isModelDeviceMappingPresent = doesModelDeviceMappingPresent(deviceModelMapping)
    const event = {device_uuid: "device-1", data_item_name: "foo", value: "bar"}
    expect(isModelDeviceMappingPresent(event)).to.be.true
  })

  it("should return false for devices which are absent in device model mapping", () => {
    const isModelDeviceMappingPresent = doesModelDeviceMappingPresent(deviceModelMapping)
    const event = {device_uuid: "device-10", data_item_name: "foo", value: "bar"}
    expect(isModelDeviceMappingPresent(event)).to.be.false
  })
})
