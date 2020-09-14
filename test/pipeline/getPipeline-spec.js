import {from} from "rxjs"
import fs from "fs"
import nock from "nock"
import * as kafkaProducer from "../../src/kafkaProducer"
import {getPipeline} from "../../src/pipeline/getPipeline"
import {getMockLog} from "../stubs/logger"
import {getDecompressedGCPEvent} from "../utils/getMockGCPEvent"
import {ACK_MSG_TAG} from "../../src/constants"
import {clearEnv, setChannelDecoderConfigFileEnvs, setGen2Envs} from "../utils"
import {getMockMetricRegistry} from "../stubs/getMockMetricRegistry"
import {clearStub} from "../stubs/clearStub"
import {getTokenStub} from "../stubs/getTokenStub"
import {mockDeviceRegistryPostSuccessResponse} from "../utils/mockDeviceRegistryResponse"

const {env} = process

describe("Pipeline spec", () => {
  let probePath
  let appContext
  let acknowledgeMessageSpy
  const url = "https://svc-device-registry.com/device-registry"
  const endpoint = "/devices"
  let getToken
  let log
  const apiConfig = {
    plant: "test",
    url: `${url}${endpoint}`,
    subject: "svc-ather-collector",
    permissions: ["reports:read"]
  }

  beforeEach(() => {
    env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
    env.VI_SHOULD_DEDUP_DATA = "true"
    setChannelDecoderConfigFileEnvs()
    acknowledgeMessageSpy = sinon.spy()
    getToken = getTokenStub()
    log = getMockLog()
    appContext = {
      metricRegistry: getMockMetricRegistry(),
      log,
      apiConfig,
      getToken
    }
    probePath = `${process.cwd()}/test/fixtures/probe`

    sinon.stub(kafkaProducer, "getKafkaSender").callsFake(() => {
      return stream => stream
    })
  })

  afterEach(() => {
    clearEnv()
    clearStub()
    nock.cleanAll()
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

  it("valid events flow through the pipeline when model for device is present", done => {
    env.VI_SHOULD_DROP_EVENTS_FOR_DEVICE_WITHOUT_MODEL = "true"
    const response = [
      {device: "s_3432", model: "A"},
      {device: "device-2", model: "B"}
    ]
    mockDeviceRegistryPostSuccessResponse(url, endpoint, response)

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
        expect(output.filter(e => e.tag === ACK_MSG_TAG).length).to.eql(2) // two ack event, as we acknowledge invalid event also
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

  it("should ack and filter out events when model for device is not present", done => {
    env.VI_SHOULD_DROP_EVENTS_FOR_DEVICE_WITHOUT_MODEL = "true"
    const response = [
      {device: "device-1", model: "A"},
      {device: "device-2", model: "B"}
    ]
    mockDeviceRegistryPostSuccessResponse(url, endpoint, response)

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
        expect(output.length).to.eql(2)
        expect(output.filter(e => e.tag === ACK_MSG_TAG).length).to.eql(2) // two ack event, as we acknowledge invalid event also
        expect(log.warn.callCount).to.eql(120) // logging one warn for each event in message
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

  it("valid events flow through pipeline from source kafka", done => {
    setGen2Envs()
    const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/GEN_2`))
    const source = {
      stream: from([
        {
          message: {data: Buffer.from(input.value.data), attributes: input.attributes},
          acknowledgeMessage: acknowledgeMessageSpy
        },
        {message: "foobar", acknowledgeMessage: acknowledgeMessageSpy}
      ])
    }
    const output = []
    const observer = {
      next: message => {
        output.push(message)
      },
      complete: () => {
        expect(output.length).to.eql(3)
        expect(output.filter(e => e.channel === "buffered_channel").length).to.eql(1) // after deduping only 1 message
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
