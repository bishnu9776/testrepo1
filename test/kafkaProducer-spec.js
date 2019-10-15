import {from, of} from "rxjs"
import {getKafkaProducer} from "../src/kafkaProducer"
import {log} from "./mocks/logger"
import {metricRegistry} from "./mocks/metricRegistry"
import {getMockDataItems} from "./mocks/getMockDataItems"

describe.skip("Kafka producer spec", () => {
  const MockProducer = {
    setPollInterval: () => {
      console.log("Called set poll interval")
    },
    flush: () => {},
    produce: (_, __, ___, ____, _____, cb) => {
      console.log("producer called")
      cb()
    },
    disconnect: () => {}
  }

  let producer
  describe("handle valid events", () => {
    beforeEach(() => {
      producer = sinon.stub(MockProducer)
      process.env.VI_PRODUCER_BUFFER_TIME_SPAN = "100"
    })

    afterEach(() => {
      producer.setPollInterval.restore()
      producer.flush.restore()
      producer.produce.restore()
      producer.disconnect.restore()
      delete process.env.VI_PRODUCER_BUFFER_TIME_SPAN
    })

    const Producer = () => ({
      producer$: () => of(producer)
    })

    it("filters for valid tag", done => {
      getKafkaProducer({log, Producer, metricRegistry})(from(getMockDataItems(3))).subscribe({
        next: () => {
          // console.log(x)
        },
        complete: () => {
          done()
        },
        error: error => {
          done(error)
        }
      })
    })
    it("writes messages to configured topics", () => {
      // ack not sent
      // dataitems are sent out
    })
  })

  // describe("handlers errors", () => {
  //   const producerStreamStub = sinon.stub()
  //   producerStreamStub.onCall(0).returns(throwError(new Error("Failed to connect to kafka")))
  //   producerStreamStub.onCall(1).returns(throwError(new Error("Failed to connect to kafka")))
  //   producerStreamStub.onCall(2).returns(throwError(new Error("Failed to connect to kafka")))
  //   producerStreamStub.returns(of(MockProducer))
  //
  //   const Producer = () => ({
  //     producer$: producerStreamStub
  //   })
  //
  //   it("does not retry and throws error on losing connection to kafka")
  // })
})
