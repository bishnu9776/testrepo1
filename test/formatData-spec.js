import {formatData} from "../src/formatData/formatData"
import probe from "./mocks/probe.json"
import {ACK_MSG_TAG} from "../src/constants"
import {metricRegistry} from "./mocks/metricRegistry"
import {getCompressedMockGCPEvent, getMockGCPEvent} from "./mocks/getMockGCPEvent"
import {CAN} from "./mocks/CAN"
import {log} from "./mocks/logger"

describe("Format data", () => {
  const formattedData = [
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
      value: "0"
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

  describe("Compressed data", () => {
    it("formats events and adds ack event to end of array", async () => {
      const message = getCompressedMockGCPEvent(CAN)
      const output = await formatData({log: console, metricRegistry, probe})(message)
      expect(output).to.eql(formattedData.concat({tag: ACK_MSG_TAG, message}))
    })
  })

  describe("Decompressed data", () => {
    before(() => {
      process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
    })

    after(() => {
      delete process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG
    })

    it("formats events and adds ack event to end of array", async () => {
      const message = getMockGCPEvent(CAN)
      const output = await formatData({log, metricRegistry, probe})(message)
      expect(output).to.eql(formattedData.concat({tag: ACK_MSG_TAG, message}))
    })
  })

  describe("Bad data", () => {
    it("returns null if unable to parse", async () => {
      const output = await formatData({log, metricRegistry, probe})("foo")
      expect(output).to.eql(null)
    })
  })
})
