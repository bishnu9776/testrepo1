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

  it.skip("pre big sink data - formats events and adds ack event to end of array", () => {})

  it("logs error and returns empty if unable to decompress", async () => {
    const messageParser = getMessageParser({log, metricRegistry, probe})
    const output = await messageParser("foo")
    expect(output).to.eql([])
  })

  it.skip("logs error and returns empty if unable to parse", () => {})
})
