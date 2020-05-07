import {getMessageParser} from "../../src/messageParser"
import probe from "../fixtures/probe.json"
import {ACK_MSG_TAG} from "../../src/constants"
import {metricRegistry} from "../stubs/metricRegistry"
import {getZipCompressedGCPEvent} from "../utils/getMockGCPEvent"
import {CAN} from "../fixtures/bikeChannels/CAN"
import {log} from "../stubs/logger"
import {clearEnv} from "../utils"

const {env} = process

describe("Parse GCP message", () => {
  afterEach(() => {
    clearEnv()
  })

  const parsedGCPEvents = [
    {
      bigsink_timestamp: "2019-10-05T18:27:19.775Z",
      channel: "can",
      component: "mcu",
      data_item_id: "MCU_SOC-v1",
      data_item_name: "MCU_SOC",
      data_item_type: "mcu_soc",
      device_uuid: "s_2404",
      sequence: 347731,
      timestamp: "2019-10-05T18:26:31.477Z",
      value: 0
    },
    {
      bigsink_timestamp: "2019-10-05T18:27:19.775Z",
      category: "SAMPLE",
      channel: "can",
      data_item_id: "MCU_CHARGER_TYPE-v1",
      data_item_name: "MCU_CHARGER_TYPE",
      data_item_type: "mcu_charger",
      device_uuid: "s_2404",
      sequence: 347731,
      timestamp: "2019-10-05T18:26:31.477Z",
      value_sample: 0
    }
  ]

  it("post big sink data - formats events and adds ack event to end of array", async () => {
    env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "true"
    const messageParser = getMessageParser({log, metricRegistry, probe})
    const message = getZipCompressedGCPEvent(CAN)
    const output = await messageParser(message)
    expect(output).to.eql(parsedGCPEvents.concat({tag: ACK_MSG_TAG, message}))
  })

  it.skip("pre big sink data - formats events and adds ack event to end of array", () => {
    env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "true"
    env.VI_PRE_BIG_SINK_INPUT = "true"

    // have one deflate compressed message with channel gpstpv
    // have one avro message with channel events
    // have one deflate compressed message with channel can_bms with one can_id
    // have one avro message with channel v1/can_*/v1_0 with one can_id
  })

  it("logs error and returns empty if unable to parse", async () => {
    const messageParser = getMessageParser({log, metricRegistry, probe})
    const output = await messageParser("foo")
    expect(output).to.eql([])
  })
})
