import {from} from "rxjs"
import fs from "fs"
import * as kafkaProducer from "../../src/kafkaProducer"
import {getPipeline} from "../../src/pipeline/getPipeline"
import {getMockLog} from "../stubs/logger"
import {getDecompressedGCPEvent} from "../utils/getMockGCPEvent"
import {ACK_MSG_TAG} from "../../src/constants"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../utils"
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
    setChannelDecoderConfigFileEnvs()
    appContext = {
      metricRegistry: getMockMetricRegistry(),
      log: getMockLog()
    }
    probePath = `${process.cwd()}/test/fixtures/probe`

    sinon.stub(kafkaProducer, "getKafkaSender").callsFake(() => {
      return stream => stream
    })
  })

  afterEach(() => {
    clearEnv()
    clearStub()
  })

  it("valid events flow through pipeline from source gcp", done => {
    const source = {
      stream: from([
        {message: getDecompressedGCPEvent("/test/fixtures/avro/CAN_MCU"), acknowledgeMessage: acknowledgeMessageSpy},
        {message: "foobar", acknowledgeMessage: acknowledgeMessageSpy}
      ])
    }
    const output = []
    const observer = {
      next: message => {
        output.push(message)
      },
      complete: () => {
        expect(output.length).to.eql(122)
        expect(output.filter(e => e.data_item_name === "can_raw").length).to.eql(100)
        expect(output.filter(e => e.channel === "can_mcu/v1_0_0" && e.data_item_name !== "can_raw").length).to.eql(20)
        expect(output.filter(e => e.tag === ACK_MSG_TAG).length).to.eql(2) // two ack event, as we acknowledge invalid event also
        expect(acknowledgeMessageSpy.callCount).to.eql(2)
        done()
      }
    }

    getPipeline({
      source,
      observer,
      probePath,
      kafkaProducer,
      appContext
    })
  })

  it.skip("valid events flow through pipeline from source kafka", done => {
    const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/GEN_2`))
    const source = {
      stream: from([
        {message: input, acknowledgeMessage: acknowledgeMessageSpy},
        {message: "foobar", acknowledgeMessage: acknowledgeMessageSpy}
      ])
    }
    const output = []
    const observer = {
      next: message => {
        output.push(message)
      },
      complete: () => {
        expect(output.length).to.eql(22)
        expect(output.filter(e => e.tag === ACK_MSG_TAG).length).to.eql(2) // two ack event, as we acknowledge invalid event also
        expect(acknowledgeMessageSpy.callCount).to.eql(2)
        done()
      }
    }

    getPipeline({
      source,
      observer,
      probePath,
      kafkaProducer,
      appContext
    })
  })

  it.skip("retry's observable chain if producing to kafka fails", () => {})

  it.skip("retry's observable chain if error on gcp stream", () => {})
})
