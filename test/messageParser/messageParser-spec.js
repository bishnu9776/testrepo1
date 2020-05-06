import {getMessageParser} from "../../src/messageParser"
import probe from "../fixtures/probe.json"
import {ACK_MSG_TAG} from "../../src/constants"
import {metricRegistry} from "../stubs/metricRegistry"
import {getCompressedGCPEvent, getDecompressedGCPEvent} from "../utils/getMockGCPEvent"
import {CAN} from "../fixtures/bikeChannels/CAN"
import {log} from "../stubs/logger"
import {clearEnv} from "../utils"

describe("Parse GCP message", () => {
  let messageParser
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

  describe("Zlib zip compressed data", () => {
    beforeEach(() => {
      process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "true"
      messageParser = getMessageParser({log, metricRegistry, probe})
    })

    it("formats events and adds ack event to end of array", async () => {
      const message = getCompressedGCPEvent(CAN)
      const output = await messageParser(message)
      expect(output).to.eql(parsedGCPEvents.concat({tag: ACK_MSG_TAG, message}))
    })

    it("returns empty if unable to decompress", async () => {
      const output = await messageParser("foo")
      expect(output).to.eql([])
    })
  })

  describe("Uncompressed data", () => {
    beforeEach(() => {
      process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
      messageParser = getMessageParser({log, metricRegistry, probe})
    })

    it("formats events and adds ack event to end of array", async () => {
      const message = getDecompressedGCPEvent(CAN)
      const output = await messageParser(message)
      expect(output).to.eql(parsedGCPEvents.concat({tag: ACK_MSG_TAG, message}))
    })

    it("returns empty if unable to parse as json", async () => {
      const output = await messageParser({data: "foo"})
      expect(output).to.eql([])
    })
  })

  // TODO: Discuss with group if we're missing some abstractions in writing tests
  // There's tests for decompressMessage, then messageParser, then getPipeline.
  // I think it's enough to cover every case in decompressMessage, and just one case in the rest of the functions
  describe("Avro data", () => {
    it("formats events and adds ack event to end of array", () => {})

    it("returns empty if unable to parse as json", () => {})
  })

  describe("Zlib inflate compressed data", () => {
    it("formats events and adds ack event to end of array", () => {})

    it("returns empty if unable to parse as json", () => {})
  })
})
