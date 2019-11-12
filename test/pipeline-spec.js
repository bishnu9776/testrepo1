import {from} from "rxjs"
import * as gcpSubscriber from "../src/gcpSubscriber"
import * as kafkaProducer from "../src/kafkaProducer"
import {CAN} from "./mocks/CAN"
import {getPipeline} from "../src/pipeline"
import {log} from "./mocks/logger"
import {getMockGCPEvent} from "./mocks/getMockGCPEvent"
import {ACK_MSG_TAG} from "../src/constants"

describe("Pipeline spec", () => {
  let gcpSubscriberStub
  let kafkaProducerStub

  const acknowledgeMessageSpy = sinon.spy()
  beforeEach(() => {
    process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
    process.env.VI_COLLECTOR_PROBE_PATH = `${process.cwd()}/test/mocks/probe`
    process.env.VI_STATS_INTERVAL = "0"
    gcpSubscriberStub = sinon.stub(gcpSubscriber, "getGCPStream").callsFake(() => {
      return {
        stream: from([getMockGCPEvent(CAN), "foobar"]),
        acknowledgeMessage: acknowledgeMessageSpy
      }
    })

    kafkaProducerStub = sinon.stub(kafkaProducer, "getKafkaProducer").callsFake(() => {
      return stream => stream
    })
  })

  afterEach(() => {
    gcpSubscriberStub.restore()
    kafkaProducerStub.restore()
    delete process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG
  })

  it("valid events flow through pipeline", done => {
    const output = []
    const observer = {
      next: e => {
        output.push(e)
      },
      complete: () => {
        expect(output.length).to.eql(3)
        expect(output.filter(e => e.channel === "can").length).to.eql(2) // Two deduped CAN events
        expect(output.filter(e => e.tag === ACK_MSG_TAG).length).to.eql(1) // One Ack event
        expect(acknowledgeMessageSpy.callCount).to.eql(1)
        done()
      }
    }

    getPipeline({log, observer})
  })
})
