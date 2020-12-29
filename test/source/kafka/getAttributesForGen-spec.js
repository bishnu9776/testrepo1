import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"
import {
  getAttributesForGen,
  getAttributesForGen1,
  getAttributesForGen2
} from "../../../src/source/kafka/getAttributesForGen"
import {getMockLog} from "../../stubs/logger"

describe("getAttributesForGen spec", () => {
  let metricRegistry
  let log
  let appContext

  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
  })

  it("should throw error when gen attribute mapping is not defined", () => {
    expect(() => getAttributesForGen("foo", appContext)).to.throw(`genAttribute mapping not defined for gen: foo`)
    expect(log.error.callCount).to.eql(1)
  })

  describe("GEN 1", () => {
    it("should throw if device is not defined", () => {
      const headers = [{inputTopic: ".devices.gen-1"}]
      expect(() => getAttributesForGen1(headers, metricRegistry)).to.throw(
        `Device/channel not present, topic: ${headers[0].inputTopic}`
      )
    })

    it("should throw if version is not defined", () => {
      const headers = [{inputTopic: ".devices.gen-1.device_1.events"}]
      expect(() => getAttributesForGen1(headers, metricRegistry)).to.throw(
        `Device/channel not present, topic: ${headers[0].inputTopic}`
      )
    })

    it("should throw if channel is not defined", () => {
      const headers = [{inputTopic: ".devices.gen-1.device_1.events.v1"}]
      expect(() => getAttributesForGen1(headers, metricRegistry)).to.throw(
        `Device/channel not present, topic: ${headers[0].inputTopic}`
      )
    })

    it("should throw if component is not specified for can channel", () => {
      const headers = [{inputTopic: ".devices.gen-1.device_1.events.v1.can_bms"}]
      expect(() => getAttributesForGen1(headers, metricRegistry)).to.throw(
        `Component is not present, topic: ${headers[0].inputTopic}`
      )
    })

    it("should parse attributes correctly", () => {
      const headers = [{inputTopic: ".devices.gen-1.device_1.events.v1.foo"}]
      const {deviceId, subFolder} = getAttributesForGen1(headers, metricRegistry)
      expect(deviceId).to.be.eql("device_1")
      expect(subFolder).to.be.eql("v1/foo")
    })

    it("should parse attributes with component correctly", () => {
      const headers = [{inputTopic: ".devices.gen-1.device_1.events.v1.can_bms.v1_0_0"}]
      const {deviceId, subFolder} = getAttributesForGen1(headers, metricRegistry)
      expect(deviceId).to.be.eql("device_1")
      expect(subFolder).to.be.eql("v1/can_bms/v1_0_0")
    })
  })

  describe("GEN 2", () => {
    describe("legacy attribute structure", () => {
      it("should throw if device is not defined", () => {
        const headers = [{inputTopic: ".devices"}]
        expect(() => getAttributesForGen2(headers, metricRegistry)).to.throw(
          `Device/channel not present, topic: ${headers[0].inputTopic}`
        )
      })

      it("should throw if version is not defined", () => {
        const headers = [{inputTopic: ".devices.device_1.events"}]
        expect(() => getAttributesForGen2(headers, metricRegistry)).to.throw(
          `Device/channel not present, topic: ${headers[0].inputTopic}`
        )
      })

      it("should throw if channel is not defined", () => {
        const headers = [{inputTopic: ".devices.device_1.events.v1"}]
        expect(() => getAttributesForGen2(headers, metricRegistry)).to.throw(
          `Device/channel not present, topic: ${headers[0].inputTopic}`
        )
      })

      it("should parse attributes correctly", () => {
        const headers = [{inputTopic: ".devices.device_1.events.v1.foo"}]
        const {deviceId, subFolder} = getAttributesForGen2(headers, metricRegistry)
        expect(deviceId).to.be.eql("device_1")
        expect(subFolder).to.be.eql("v1/foo")
      })
    })

    describe("new attribute structure", () => {
      it("should throw if device is not defined", () => {
        const headers = [{inputTopic: ".devices.Gen-2"}]
        expect(() => getAttributesForGen2(headers, metricRegistry)).to.throw(
          `Device/channel not present, topic: ${headers[0].inputTopic}`
        )
      })

      it("should throw if version is not defined", () => {
        const headers = [{inputTopic: ".devices.Gen-2.device_1.events"}]
        expect(() => getAttributesForGen2(headers, metricRegistry)).to.throw(
          `Device/channel not present, topic: ${headers[0].inputTopic}`
        )
      })

      it("should throw if channel is not defined", () => {
        const headers = [{inputTopic: ".devices.Gen-2.device_1.events.v1"}]
        expect(() => getAttributesForGen2(headers, metricRegistry)).to.throw(
          `Device/channel not present, topic: ${headers[0].inputTopic}`
        )
      })

      it("should parse attributes correctly", () => {
        const headers = [{inputTopic: ".devices.Gen-2.device_1.events.v1.foo"}]
        const {deviceId, subFolder} = getAttributesForGen2(headers, metricRegistry)
        expect(deviceId).to.be.eql("device_1")
        expect(subFolder).to.be.eql("v1/foo")
      })

      it("should parse attributes correctly with case incensitive gen info", () => {
        const headers = [{inputTopic: ".devices.gen-2.device_1.events.v1.foo"}]
        const {deviceId, subFolder} = getAttributesForGen2(headers, metricRegistry)
        expect(deviceId).to.be.eql("device_1")
        expect(subFolder).to.be.eql("v1/foo")
      })
    })
  })
})
