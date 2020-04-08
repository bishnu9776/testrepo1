import {from} from "rxjs"
import {clearEnv} from "./utils"
import {getKafkaSender} from "../src/kafkaProducer"
import {metricRegistry} from "./stubs/metricRegistry"
import {log} from "./stubs/logger"
import {getAckEvent, getMockDataItems} from "./utils/getMockDataItems"

const {env} = process

describe("Kafka producer", () => {
  const kafkaProducerStub = {
    flush: () => {},
    produce: () => {}
  }

  afterEach(() => {
    kafkaProducerStub.flush.restore()
    kafkaProducerStub.produce.restore()
    clearEnv()
  })

  describe("sends events correctly", () => {
    beforeEach(() => {
      sinon.stub(kafkaProducerStub, "flush").callsFake((timeout, callback) => {
        callback(null)
      })
      sinon.stub(kafkaProducerStub, "produce").callsFake((_topic, _partition, _buffer, _key, _time, cb) => {
        cb()
      })
    })

    it("sends all data items to archive topic, whitelisted data items to configured topics, drops events without tag", done => {
      env.VI_KAFKA_SINK_DATA_TOPIC = "test"
      env.VI_KAFKA_SINK_ARCHIVE_TOPIC = "test-archive"
      env.VI_DATAITEM_WHITELIST = "mode"
      env.VI_PRODUCER_BUFFER_TIME_SPAN = "100"

      const sendToKafka = getKafkaSender({kafkaProducer: kafkaProducerStub, metricRegistry, log})

      const sourceEvents = [
        ...getMockDataItems(1, "device-1", "mode"),
        ...getMockDataItems(1, "device-2", "location"),
        getAckEvent()
      ]
      const actualEvents = []

      sendToKafka(from([...sourceEvents, {message: "tag-is-missing"}])).subscribe({
        next: x => {
          actualEvents.push(x)
        },
        complete: () => {
          expect(actualEvents).to.deep.eql(sourceEvents)
          expect(kafkaProducerStub.produce).to.have.been.calledThrice
          expect(kafkaProducerStub.produce).to.have.been.calledWithMatch(
            "test",
            null,
            Buffer.from(JSON.stringify(sourceEvents[0])),
            "device-1"
          )
          expect(kafkaProducerStub.produce).to.have.been.calledWithMatch(
            "test-archive",
            null,
            Buffer.from(JSON.stringify(sourceEvents[0])),
            "device-1"
          )
          expect(kafkaProducerStub.produce).to.have.been.calledWithMatch(
            "test-archive",
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

  describe("handles errors gracefully", () => {
    beforeEach(() => {
      sinon.stub(kafkaProducerStub, "flush").callsFake((timeout, callback) => {
        callback(null)
      })
      sinon.stub(kafkaProducerStub, "produce").callsFake((_topic, _partition, _buffer, _key, _time, cb) => {
        cb(new Error("Could not send message to Kafka"))
      })
    })

    it("flushes and throws error if kafka send fails", done => {
      env.VI_KAFKA_SINK_DATA_TOPIC = "test"

      const sourceEvents = getMockDataItems(1, "device-1")
      const sendToKafka = getKafkaSender({kafkaProducer: kafkaProducerStub, metricRegistry, log})

      sendToKafka(from(sourceEvents)).subscribe({
        error: error => {
          expect(kafkaProducerStub.produce).to.have.been.calledOnce
          expect(kafkaProducerStub.produce).to.have.been.calledWithMatch(
            "test",
            null,
            Buffer.from(JSON.stringify(sourceEvents[0])),
            "device-1"
          )
          expect(kafkaProducerStub.flush).to.have.been.called
          expect(error.message).to.eql("Could not send message to Kafka")
          done()
        }
      })
    })
  })
})
