import {omit} from "ramda"
import {mergeProbeInfo} from "../src/formatData/mergeProbeInfo"
import probe from "./mocks/probe.json"
import {getMockDataItemDoc} from "./mocks/getMockDataItemDoc"

describe("Merge probe info", () => {
  const mergeProbeFunction = mergeProbeInfo(probe)
  it("should stringify value in the value key", () => {
    const mockDataItem = getMockDataItemDoc({value: 1, dataItemName: "MCU_SOC"})
    expect(mergeProbeFunction(mockDataItem)).to.eql({
      ...mockDataItem,
      component: "mcu",
      data_item_type: "mcu_soc",
      value: "1"
    })
  })
  it("should return value_event for data item of category EVENT", () => {
    const mockDataItem = getMockDataItemDoc({value: "high", dataItemName: "BMS_ThermalAlert"})
    expect(mergeProbeFunction(mockDataItem)).to.eql({
      ...omit(["value"], mockDataItem),
      data_item_type: "bms_thermal_alert",
      value_event: "high",
      category: "EVENT"
    })
  })
  it("should return value_sample for data item of category SAMPLE", () => {
    const mockDataItem = getMockDataItemDoc({value: 1, dataItemName: "MCU_CHARGER_TYPE"})
    expect(mergeProbeFunction(mockDataItem)).to.eql({
      ...omit(["value"], mockDataItem),
      category: "SAMPLE",
      data_item_type: "mcu_charger",
      value_sample: 1
    })
  })
  it("should return value_location for data item of category LOCATION", () => {
    const mockDataItem = getMockDataItemDoc({value: 10.5, dataItemName: "GPS_TPV"})
    expect(mergeProbeFunction(mockDataItem)).to.eql({
      ...omit(["value"], mockDataItem),
      category: "LOCATION",
      data_item_type: "lat_val",
      value_location: 10.5
    })
  })
})
