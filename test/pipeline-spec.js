import {from} from "rxjs"
import * as gcpSubscriber from "../src/gcpSubscriber"
import * as kafkaProducer from "../src/kafkaProducer"
import {CAN} from "./mocks/CAN"
import {getPipeline} from "../src/pipeline"
import {metricRegistry} from "./mocks/metricRegistry"
import probe from "./mocks/probe"
import {log} from "./mocks/logger"
import {getMockGCPEvent} from "./mocks/getMockGCPEvent"
import {ACK_MSG_TAG} from "../src/constants"

describe("Pipeline spec", () => {
  let gcpSubscriberStub
  let kafkaProducerStub

  beforeEach(() => {
    process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
    gcpSubscriberStub = sinon.stub(gcpSubscriber, "getGCPStream").callsFake(() => {
      return {
        stream: from([getMockGCPEvent(CAN), "foobar"]),
        acknowledgeMessage: () => {}
      }
    })

    kafkaProducerStub = sinon.stub(kafkaProducer, "getKafkaProducer").callsFake(stream => stream)
  })

  afterEach(() => {
    gcpSubscriberStub.restore()
    kafkaProducerStub.restore()
    delete process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG
  })

  it("valid events flow through pipeline", done => {
    const output = []
    getPipeline({metricRegistry, probe, log}).subscribe({
      next: e => {
        output.push(e)
      },
      complete: () => {
        expect(output.length).to.eql(3)
        expect(output.filter(e => e.channel === "can").length).to.eql(2) // Two deduped CAN events
        expect(output.filter(e => e.tag === ACK_MSG_TAG).length).to.eql(1) // One Ack event
        done()
      }
    })
  })
})
