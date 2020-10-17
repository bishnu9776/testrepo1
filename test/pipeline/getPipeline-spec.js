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
import {mockDeviceRulesGetSuccess, mockDeviceRulesPutAnyDevice} from "../apiResponseMocks/mockDeviceRulesResponse"

const {env} = process

describe("Pipeline spec", () => {
  let probePath
  let appContext
  const acknowledgeMessageSpy = sinon.spy()
  const deviceRulesUrl = "https://svc-device-rules.com/device-rules"
  let log

  beforeEach(() => {
    env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
    env.VI_PROBE_DATAITEM_WHITELIST = "MCU_SOC"
    env.VI_SHOULD_DEDUP_DATA = "true"
    env.VI_SHOULD_SEND_PROBE = "true"
    env.VI_GEN1_DATAITEM_ID_VERSION = "v1"
    env.VI_PROBE_ES_SCHEMA_VERSION = "4"
    env.VI_DATAITEM_ES_SCHEMA_VERSION = "3"
    env.VI_SHOULD_SEND_PROBE = "true"
    env.VI_PLANT = "ather"
    env.VI_DEVICE_RULES_URL = deviceRulesUrl
    env.VI_SHOULD_UPDATE_DEVICE_RULES = "true"
    setChannelDecoderConfigFileEnvs()
    log = getMockLog()
    appContext = {
      metricRegistry: getMockMetricRegistry(),
      log
    }
    probePath = `${process.cwd()}/test/fixtures/probe`

    sinon.stub(kafkaProducer, "getKafkaSender").callsFake(() => {
      return stream => stream
    })

    mockDeviceRulesGetSuccess({
      baseUrl: deviceRulesUrl,
      getUrl: `/device/ruleset`,
      response: []
    })

    mockDeviceRulesPutAnyDevice({baseUrl: deviceRulesUrl})
  })

  afterEach(() => {
    acknowledgeMessageSpy.resetHistory()
    clearEnv()
    clearStub()
    nock.cleanAll()
  })

  describe("bike", () => {
    it("gen 1 bike events flow through pipeline from source gcp", done => {
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
          const probeEvent = output.filter(e => e.tag === "MTConnectDevices")
          expect(output.length).to.eql(122)
          expect(output.filter(e => e.data_item_name === "can_raw").length).to.eql(100)
          output.filter(e => e.data_item_name === "can_raw").every(e => expect(e.data_item_id).to.eql("can_raw-v1"))
          output.filter(e => e.tag === "MTConnectDataItems").every(e => expect(e.schema_version).to.eql("3"))
          expect(probeEvent.length).to.eql(1)
          expect(probeEvent[0].schema_version).to.eql("4")
          expect(output.filter(e => e.channel === "can_mcu/v1_0_0" && e.data_item_name !== "can_raw").length).to.eql(20)
          expect(output.filter(e => e.tag === ACK_MSG_TAG).length).to.eql(1)
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

    it("gen 1bike events flow through the pipeline when model for device is present", done => {
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
          expect(output.filter(e => e.tag === ACK_MSG_TAG).length).to.eql(1)
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

    it("gen 2 bike events flow through pipeline from source kafka", done => {
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
          const probeEvent = output.filter(e => e.tag === "MTConnectDevices")
          const dataItemEvent = output.filter(e => e.tag === "MTConnectDataItems")
          expect(output.length).to.eql(3)
          output.every(e => expect(e.plant).to.eql("ather"))
          expect(dataItemEvent.length).to.eql(1)
          expect(dataItemEvent[0].schema_version).to.eql("3")
          expect(dataItemEvent[0].data_item_id).to.eql("s_123-BMS_Cell3")
          expect(output.filter(e => e.channel === "buffered_channel").length).to.eql(1) // after deduping only 1 message
          expect(probeEvent.length).to.eql(1)
          expect(probeEvent[0].schema_version).to.eql("4")
          expect(probeEvent.length).to.eql(1)
          expect(output.filter(e => e.tag === ACK_MSG_TAG).length).to.eql(1)
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
  })

  describe("ci", () => {
    it("post big sink ci events flow through pipeline from source gcp", done => {
      process.env.VI_INPUT_TYPE = "ci"
      process.env.VI_SHOULD_SEND_PROBE = "false"
      process.env.VI_SHOULD_UPDATE_DEVICE_RULES = "false"
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

    it.skip("pre big sink ci events flow through pipeline from source gcp", () => {
      // deserialises using avro for rms_data and logs, decodes rms_data and can_raw, parses other channels as byte arrays
    })
  })

  describe("dropping devices / channels", () => {
    it("drops events whose channel is in drop list or device matches given regex", done => {
      env.VI_CHANNELS_TO_DROP = "can_mcu/v1_0_0"
      env.VI_SHOULD_FILTER_DEVICE = "true"
      env.VI_DEVICE_FILTER_REGEX = "s_101"

      const message = getDecompressedGCPEvent("/test/fixtures/avro/CAN_MCU")
      const source = {
        stream: from([
          {message, acknowledgeMessage: acknowledgeMessageSpy},
          {
            message: {...message, attributes: {...message.attributes, deviceId: "s_100", subFolder: "can_mcu/v1_2_0"}},
            acknowledgeMessage: acknowledgeMessageSpy
          }
        ])
      }
      const output = []
      const observer = {
        next: e => {
          output.push(e)
        },
        complete: () => {
          expect(output.length).to.eql(0)
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
  })
})
