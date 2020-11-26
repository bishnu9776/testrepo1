import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"
import {getAttributesForGen2} from "../../../src/source/kafka/kafkaStream"

describe("getAttributesForGen spec", () => {
  let metricRegistry

  beforeEach(() => {
    metricRegistry = getMockMetricRegistry()
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

      it("should throw if component is not defined", () => {
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

      it("should throw if component is not defined", () => {
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
