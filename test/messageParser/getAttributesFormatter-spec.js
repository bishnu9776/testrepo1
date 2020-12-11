import {getMockMetricRegistry} from "../stubs/getMockMetricRegistry"
import {clearEnv} from "../utils"
import {getAttributesFormatter} from "../../src/messageParser/getAttributesFormatter"

describe("get attribute formatter", () => {
  let metricRegistry

  describe("should format attribute for bikes", () => {
    beforeEach(() => {
      process.env.VI_INPUT_TYPE = "bike"
      metricRegistry = getMockMetricRegistry()
    })

    after(() => {
      clearEnv()
    })

    it("should format attributes of new bikes messages correctly", () => {
      const formatEvent = getAttributesFormatter(metricRegistry)
      const attributes = {subFolder: "v1/can_mcu/v1_0_0", deviceId: "device-1"}
      expect(formatEvent(attributes)).to.eql({
        channel: "can_mcu/v1_0_0",
        device_id: "device-1",
        version: "v1"
      })
    })

    it("should format attributes of legacy bikes messages correctly", () => {
      const formatEvent = getAttributesFormatter(metricRegistry)
      const attributes = {subFolder: "can_mcu/v1_0_0", deviceId: "device-1"}
      expect(formatEvent(attributes)).to.eql({
        channel: "can_mcu/v1_0_0",
        device_id: "device-1",
        version: "legacy"
      })
    })
  })

  describe("should format attribute for grid", () => {
    beforeEach(() => {
      process.env.VI_INPUT_TYPE = "ci"
      metricRegistry = getMockMetricRegistry()
    })

    after(() => {
      clearEnv()
    })

    it("should handle pre big sink data correctly", () => {
      process.env.VI_CI_PRE_BIG_SINK_MODE = "true"
      const formatEvent = getAttributesFormatter(metricRegistry)
      const attributes = {subFolder: "v1_5/db_data", deviceId: "DB_1"}
      expect(formatEvent(attributes)).to.eql({
        channel: "db_data",
        device_id: "DB_1",
        version: "v1_5"
      })
    })

    it("should handle post big sink data with db_id correctly,", () => {
      process.env.VI_CI_PRE_BIG_SINK_MODE = "false"
      const formatEvent = getAttributesFormatter(metricRegistry)
      const attributes = {channel: "db_data", version: "v1", db_id: "DB_1"}
      expect(formatEvent(attributes)).to.eql({
        channel: "db_data",
        device_id: "DB_1",
        version: "v1"
      })
    })

    it("should handle post big sink data with bike_id correctly,", () => {
      process.env.VI_CI_PRE_BIG_SINK_MODE = "false"
      const formatEvent = getAttributesFormatter(metricRegistry)
      const attributes = {channel: "db_data", version: "v1", bike_id: "device_1"}
      expect(formatEvent(attributes)).to.eql({
        channel: "db_data",
        device_id: "device_1",
        version: "v1"
      })
    })
  })
})
