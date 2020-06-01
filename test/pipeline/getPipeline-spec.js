import {from} from "rxjs"
import * as gcpSubscriber from "../../src/gcpSubscriber/gcpStream"
import * as kafkaProducer from "../../src/kafkaProducer"
import {CAN} from "../fixtures/bikeChannels/CAN"
import {getPipeline} from "../../src/pipeline/getPipeline"
import {log} from "../stubs/logger"
import {getDecompressedGCPEvent} from "../utils/getMockGCPEvent"
import {ACK_MSG_TAG} from "../../src/constants"
import {clearEnv} from "../utils"

const {env} = process

describe("Pipeline spec", () => {
  let gcpSubscriberStub
  let kafkaProducerStub
  let probePath
  const acknowledgeMessageSpy = sinon.spy()

  beforeEach(() => {
    env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
    env.VI_SHOULD_DEDUP_DATA = "true"

    probePath = `${process.cwd()}/test/fixtures/probe`
    gcpSubscriberStub = sinon.stub(gcpSubscriber, "getGCPStream").callsFake(() => {
      return {
        stream: from([getDecompressedGCPEvent(CAN), "foobar"]),
        acknowledgeMessage: acknowledgeMessageSpy
      }
    })

    kafkaProducerStub = sinon.stub(kafkaProducer, "getKafkaSender").callsFake(() => {
      return stream => stream
    })
  })

  afterEach(() => {
    gcpSubscriberStub.restore()
    kafkaProducerStub.restore()
    clearEnv()
  })

  it("valid events flow through pipeline", done => {
    const output = []
    const observer = {
      next: e => {
        output.push(e)
      },
      complete: () => {
        expect(output.length).to.eql(4)
        expect(output.filter(e => e.channel === "can").length).to.eql(2) // Two deduped CAN events
        expect(output.filter(e => e.tag === ACK_MSG_TAG).length).to.eql(2) // two ack event, as we acknowledge invalid event also
        expect(acknowledgeMessageSpy.callCount).to.eql(2)
        done()
      }
    }

    getPipeline({
      log,
      observer,
      probePath,
      subscriptionConfig: {},
      metricRegistry: {statsInterval: 0, updateStat: sinon.stub()},
      kafkaProducer
    })
  })

  it.skip("retry's observable chain if producing to kafka fails", () => {})

  it.skip("retry's observable chain if error on gcp stream", () => {})
})
