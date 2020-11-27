import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"
import {
  getAttributesForGen,
  getAttributesForGen1,
  getAttributesForGen2
} from "../../../src/source/kafka/getAttributesForGen"

describe("getAttributesForGen spec", () => {
  let metricRegistry

  beforeEach(() => {
    metricRegistry = getMockMetricRegistry()
  })

  it("should throw error when gen attribute mapping is not defined", () => {
    expect(() => getAttributesForGen("foo")).to.throw(`genAttribute mapping not defined for gen: foo`)
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

    it("should parse attributes correctly", () => {
      const headers = [{inputTopic: ".devices.gen-1.device_1.events.v1.foo"}]
      expect(() => getAttributesForGen1(headers, metricRegistry)).to.not.throw(
        `Device/channel not present, topic: ${headers[0].inputTopic}`
      )

      const {deviceId, subFolder} = getAttributesForGen1(headers, metricRegistry)
      expect(deviceId).to.be.eql("device_1")
      expect(subFolder).to.be.eql("v1/foo")
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
        expect(() => getAttributesForGen2(headers, metricRegistry)).to.not.throw(
          `Device/channel not present, topic: ${headers[0].inputTopic}`
        )

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
        expect(() => getAttributesForGen2(headers, metricRegistry)).to.not.throw(
          `Device/channel not present, topic: ${headers[0].inputTopic}`
        )

        const {deviceId, subFolder} = getAttributesForGen2(headers, metricRegistry)
        expect(deviceId).to.be.eql("device_1")
        expect(subFolder).to.be.eql("v1/foo")
      })

      it("should parse attributes correctly with case incensitive gen info", () => {
        const headers = [{inputTopic: ".devices.gen-2.device_1.events.v1.foo"}]
        expect(() => getAttributesForGen2(headers, metricRegistry)).to.not.throw(
          `Device/channel not present, topic: ${headers[0].inputTopic}`
        )

        const {deviceId, subFolder} = getAttributesForGen2(headers, metricRegistry)
        expect(deviceId).to.be.eql("device_1")
        expect(subFolder).to.be.eql("v1/foo")
      })
    })
  })
})
