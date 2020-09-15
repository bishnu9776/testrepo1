import {from} from "rxjs"
import nock from "nock"
import fs from "fs"
import * as kafkaProducer from "../../src/kafkaProducer"
import {getPipeline} from "../../src/pipeline/getPipeline"
import {getMockLog} from "../stubs/logger"
import {getDecompressedGCPEvent, getDeflateCompressedGCPEvent} from "../utils/getMockGCPEvent"
import {ACK_MSG_TAG} from "../../src/constants"
import {clearEnv, setChannelDecoderConfigFileEnvs, setGen2Envs} from "../utils"
import {getMockMetricRegistry} from "../stubs/getMockMetricRegistry"
import {clearStub} from "../stubs/clearStub"
import {POD_INFO} from "../messageParser/fixtures/gridChannels/POD_INFO"
import {mockDeviceRegistryPostSuccessResponse} from "../utils/mockDeviceRegistryResponse"

const {env} = process

describe("Pipeline spec", () => {
  let probePath
  let appContext
  const acknowledgeMessageSpy = sinon.spy()
  const url = "https://svc-device-registry.com/device-registry"
  const endpoint = "/devices"
  let log
  const apiConfig = {
    plant: "test",
    url: `${url}${endpoint}`
  }

  beforeEach(() => {
    env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
    env.VI_SHOULD_DEDUP_DATA = "true"
    env.VI_DATAITEM_WHITELIST =
      "vehicle_current_state,motor_current_state,odometer,MOT_NPres_RPM,BMS_Current,BMS_Voltage,MOT_Tmot_C,location,error_code,MCU_SOC,bms_status,incognito_mode,BCM_ChaType,CHA_Mode,CHA_Type,POD_AuthenticationStatus,GRID_Type,CHA_State_of_Protocol,POD_Type,POD_ID,CI_Recoverable_Fault,solenoid_feedback,release_name,betaDisplay_motorMode1,betaDisplay_motorMode2,betaDisplay_motorMode4,system_boot_time"
    setChannelDecoderConfigFileEnvs()
    log = getMockLog()
    appContext = {
      metricRegistry: getMockMetricRegistry(),
      log,
      apiConfig
    }
    probePath = `${process.cwd()}/test/fixtures/probe`

    sinon.stub(kafkaProducer, "getKafkaSender").callsFake(() => {
      return stream => stream
    })
  })

  afterEach(() => {
    acknowledgeMessageSpy.resetHistory()
    clearEnv()
    clearStub()
    nock.cleanAll()
  })

  it("bike events flow through pipeline from source gcp", done => {
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
        expect(output.length).to.eql(122) // 123 after adding probe
        // console.log(JSON.stringify(output.filter(e => e.agent === "ather-agent"), null, 2))
        expect(output.filter(e => e.data_item_name === "can_raw").length).to.eql(100)
        // expect(output.filter(e => e.agent === "ather-agent").length).to.eql(1)
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

  it("ci events flow through pipeline from source gcp", done => {
    process.env.VI_INPUT_TYPE = "ci"
    const source = {
      stream: from([{message: getDeflateCompressedGCPEvent(POD_INFO), acknowledgeMessage: acknowledgeMessageSpy}])
    }
    const output = []
    const observer = {
      next: message => {
        output.push(message)
      },
      complete: () => {
        expect(output.length).to.eql(4)
        output.every(e => expect(e.plant).to.eql("atherci"))
        expect(acknowledgeMessageSpy.callCount).to.eql(1)
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
