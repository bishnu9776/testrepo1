import {from} from "rxjs"
import * as gcpSubscriber from "../../src/gcpSubscriber/gcpStream"
import * as kafkaProducer from "../../src/kafkaProducer"
import {CAN} from "../fixtures/bikeChannels/CAN"
import {getPipeline} from "../../src/pipeline/getPipeline"
import {getMockLog} from "../stubs/logger"
import {getDecompressedGCPEvent} from "../utils/getMockGCPEvent"
import {ACK_MSG_TAG} from "../../src/constants"
import {clearEnv} from "../utils"
import {getMockMetricRegistry} from "../stubs/getMockMetricRegistry"
import {clearStub} from "../stubs/clearStub"

const {env} = process

describe("Pipeline spec", () => {
  let probePath
  let appContext
  const acknowledgeMessageSpy = sinon.spy()

  beforeEach(() => {
    env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
    env.VI_SHOULD_DEDUP_DATA = "true"
    appContext = {
      metricRegistry: getMockMetricRegistry(),
      log: getMockLog()
    }
    probePath = `${process.cwd()}/test/fixtures/probe`
    sinon.stub(gcpSubscriber, "getGCPStream").callsFake(() => {
      return {
        stream: from([getDecompressedGCPEvent(CAN), "foobar"]),
        acknowledgeMessage: acknowledgeMessageSpy
      }
    })

    sinon.stub(kafkaProducer, "getKafkaSender").callsFake(() => {
      return stream => stream
    })
  })

  afterEach(() => {
    clearEnv()
    clearStub()
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
      observer,
      probePath,
      subscriptionConfig: {},
      kafkaProducer,
      ...appContext
    })
  })

  it.skip("retry's observable chain if producing to kafka fails", () => {})

  it.skip("retry's observable chain if error on gcp stream", () => {})
})
