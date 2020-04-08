import {from} from "rxjs"
import * as gcpSubscriber from "../src/gcpSubscriber/gcpStream"
import * as kafkaProducer from "../src/kafkaProducer"
import {CAN} from "./messageParser/mockChannelData/CAN"
import {getPipeline} from "../src/pipeline"
import {log} from "./stubs/logger"
import {getDecompressedGCPEvent} from "./utils/getMockGCPEvent"
import {ACK_MSG_TAG} from "../src/constants"

describe.skip("Pipeline spec", () => {
  let gcpSubscriberStub
  let kafkaProducerStub
  let probePath

  const acknowledgeMessageSpy = sinon.spy()
  beforeEach(() => {
    process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
    probePath = `${process.cwd()}/test/mocks/probe`
    gcpSubscriberStub = sinon.stub(gcpSubscriber, "getGCPStream").callsFake(() => {
      return {
        stream: from([getDecompressedGCPEvent(CAN), "foobar"]),
        acknowledgeMessage: acknowledgeMessageSpy
      }
    })

    kafkaProducerStub = sinon.stub(kafkaProducer, "getKafkaProducer").callsFake(() => {
      return stream => stream
    })

    // TODO: Assert that kafka producer was called three times.
    // TODO: Add test for getPipelines and show that you can listen to two gcp subscriptions and produce to kafka.
    //  emit events on gcp subscriber, assert calls on kafka producer. This will cover the previous todo.
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

    getPipeline({
      log,
      observer,
      probePath,
      subscriptionConfig: {},
      metricRegistry: {statsInterval: 0, updateStat: sinon.stub()}
    })
  })

  it.skip("retry's observable chain if producing to kafka fails", () => {})

  it.skip("retry's observable chain if error on gcp stream", () => {})
})
