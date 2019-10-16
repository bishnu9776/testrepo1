import {from, of, throwError} from "rxjs"

import {getKafkaProducer} from "../src/kafkaProducer"
import {log} from "./mocks/logger"
import {metricRegistry} from "./mocks/metricRegistry"
import {getAckEvent, getMockDataItems} from "./mocks/getMockDataItems"

describe("Kafka producer spec", () => {
  const MockProducer = {
    setPollInterval: () => {},
    flush: () => {},
    produce: () => {},
    disconnect: () => {}
  }

  describe("handle valid events", () => {
    beforeEach(() => {
      process.env.VI_KAFKA_SINK_DATA_TOPIC = "test"
      process.env.VI_PRODUCER_BUFFER_TIME_SPAN = "100"
      sinon.stub(MockProducer, "flush").callsFake((timeout, callback) => {
        callback(null)
      })
      sinon.stub(MockProducer, "produce").callsFake((_topic, _partition, _buffer, _key, _time, cb) => {
        cb()
      })
    })

    afterEach(() => {
      delete process.env.VI_PRODUCER_BUFFER_TIME_SPAN
      MockProducer.flush.restore()
      MockProducer.produce.restore()
    })

    const Producer = () => ({
      producer$: () => of(MockProducer)
    })

    it("sends events to configured topics", done => {
      const sourceEvents = [...getMockDataItems(1, "device-1"), ...getMockDataItems(1, "device-2"), getAckEvent()]
      const actualEvents = []

      getKafkaProducer({log, Producer, metricRegistry})(from(sourceEvents)).subscribe({
        next: x => {
          actualEvents.push(x)
        },
        complete: () => {
          expect(actualEvents).to.deep.eql(sourceEvents)
          expect(MockProducer.produce).to.have.been.calledTwice
          expect(MockProducer.produce).to.have.been.calledWithMatch(
            "test",
            null,
            Buffer.from(JSON.stringify(sourceEvents[0])),
            "device-1"
          )
          expect(MockProducer.produce).to.have.been.calledWithMatch(
            "test",
            null,
            Buffer.from(JSON.stringify(sourceEvents[1])),
            "device-2"
          )
          done()
        },
        error: error => {
          done(error)
        }
      })
    })
  })

  describe("handlers errors", () => {
    beforeEach(() => {
      process.env.VI_KAFKA_SINK_DATA_TOPIC = "test"
      process.env.VI_PRODUCER_BUFFER_TIME_SPAN = "100"
      sinon.stub(MockProducer, "flush").callsFake((timeout, callback) => {
        callback(null)
      })
      sinon.stub(MockProducer, "produce").callsFake((_topic, _partition, _buffer, _key, _time, cb) => {
        cb(new Error("Could not send message to Kafka"))
      })
    })

    afterEach(() => {
      delete process.env.VI_PRODUCER_BUFFER_TIME_SPAN
      MockProducer.flush.restore()
      MockProducer.produce.restore()
    })

    it("on connection error, throws immediately", done => {
      const Producer = () => ({
        producer$: () => throwError(new Error("Failed to connect to Kafka"))
      })

      getKafkaProducer({log, Producer, metricRegistry})(from([])).subscribe({
        error: error => {
          expect(MockProducer.flush).to.not.have.been.called
          expect(error.message).to.eql("Failed to connect to Kafka")
          done()
        }
      })
    })

    it("on error when sending event, flushes and throws error with no retry", done => {
      const Producer = () => ({
        producer$: () => of(MockProducer)
      })

      const sourceEvents = getMockDataItems(1, "device-1")

      getKafkaProducer({log, Producer, metricRegistry})(from(sourceEvents)).subscribe({
        error: error => {
          expect(MockProducer.flush).to.have.been.called
          expect(error.message).to.eql("Could not send message to Kafka")
          done()
        }
      })
    })
  })
})
