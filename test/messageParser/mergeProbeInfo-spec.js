import {omit} from "ramda"
import {getMergeProbeInfoFn} from "../../src/messageParser/mergeProbeInfo"
import probe from "../fixtures/bike-probe.json"
import {getDataItem} from "../utils/getDataItem"

describe("Merge probe info", () => {
  describe("old probe structure", () => {
    const mergeProbeInfo = getMergeProbeInfoFn(probe)

    it("should return value in value key as is", () => {
      const mockDataItem = getDataItem({value: 1, dataItemName: "MCU_SOC"})
      expect(mergeProbeInfo(mockDataItem)).to.eql({
        ...mockDataItem,
        component: "mcu",
        data_item_type: "mcu_soc",
        value: 1
      })
    })

    it("should stringify and return value_event for data item of category EVENT", () => {
      const mockDataItem = getDataItem({value: 1, dataItemName: "BMS_ThermalAlert"})
      expect(mergeProbeInfo(mockDataItem)).to.eql({
        ...omit(["value"], mockDataItem),
        data_item_type: "bms_thermal_alert",
        value_event: "1",
        category: "EVENT"
      })
    })

    it("should return value_sample for data item of category SAMPLE", () => {
      const mockDataItem = getDataItem({value: 1, dataItemName: "MCU_CHARGER_TYPE"})
      expect(mergeProbeInfo(mockDataItem)).to.eql({
        ...omit(["value"], mockDataItem),
        category: "SAMPLE",
        data_item_type: "mcu_charger",
        value_sample: 1
      })
    })

    it("should return value_location for data item of category LOCATION", () => {
      const mockDataItem = getDataItem({value: 10.5, dataItemName: "GPS_TPV"})
      expect(mergeProbeInfo(mockDataItem)).to.eql({
        ...omit(["value"], mockDataItem),
        category: "LOCATION",
        data_item_type: "lat_val",
        value_location: 10.5
      })
    })
  })

  describe("new probe structure", () => {
    beforeEach(() => {
      process.env.VI_COLLECTOR_IS_NEW_PROBE_STRUCTURE = "true"
    })
    afterEach(() => {
      delete process.env.VI_COLLECTOR_IS_NEW_PROBE_STRUCTURE
    })
    const mergeProbeInfo = getMergeProbeInfoFn(probe)

    it("should return value in value_location and values key for category LOCATION", () => {
      const mockDataItem = getDataItem({value: {lat: 1.1, lon: 1.2}, dataItemName: "GPS_TPV"})
      const mergedMockDataItem = omit(["meta"], mergeProbeInfo(mockDataItem))
      expect(mergedMockDataItem).to.eql({
        ...omit(["value"], mockDataItem),
        data_item_type: "lat_val",
        value_location: {lat: 1.1, lon: 1.2},
        values: {lat: 1.1, lon: 1.2},
        category: "LOCATION"
      })
    })

    it("should return just values key for category COMPOSITE", () => {
      const mockDataItem = getDataItem({value: {x: 1, y: 1, z: 1}, dataItemName: "acceleration"})
      const mergedMockDataItem = omit(["meta"], mergeProbeInfo(mockDataItem))
      expect(mergedMockDataItem).to.eql({
        ...omit(["value"], mockDataItem),
        data_item_type: "ACCELERATION",
        values: {x: 1, y: 1, z: 1},
        category: "COMPOSITE"
      })
    })
  })
})
