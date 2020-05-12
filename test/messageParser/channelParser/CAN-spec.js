import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import {CAN, CAN_BMS} from "../../fixtures/bikeChannels/CAN"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"

describe("Parses CAN", () => {
  const {env} = process

  describe("VI_PRE_BIG_SINK_INPUT: false", () => {
    let createDataItemsFromMessage
    before(() => {
      env.VI_PRE_BIG_SINK_INPUT = false
      createDataItemsFromMessage = getCreateDataItemFromMessageFn()
    })

    after(() => {
      clearEnv()
    })

    it("parses given messages without decoding", () => {
      expect(createDataItemsFromMessage({...CAN, probe})).to.eql([
        {
          channel: "can",
          data_item_id: "MCU_SOC-v1",
          data_item_name: "MCU_SOC",
          device_uuid: "s_2404",
          sequence: 347731,
          timestamp: "2019-10-05T18:26:31.477Z",
          value: 0
        },
        {
          channel: "can",
          data_item_id: "MCU_CHARGER_TYPE-v1",
          data_item_name: "MCU_CHARGER_TYPE",
          device_uuid: "s_2404",
          sequence: 347731,
          timestamp: "2019-10-05T18:26:31.477Z",
          value: 0
        },
        {
          channel: "can",
          data_item_id: "MCU_SOC-v1",
          data_item_name: "MCU_SOC",
          device_uuid: "s_2404",
          sequence: 347733,
          timestamp: "2019-10-05T18:26:31.978Z",
          value: 0
        },
        {
          channel: "can",
          data_item_id: "MCU_CHARGER_TYPE-v1",
          data_item_name: "MCU_CHARGER_TYPE",
          device_uuid: "s_2404",
          sequence: 347733,
          timestamp: "2019-10-05T18:26:31.978Z",
          value: 0
        }
      ])
    })
  })

  describe("VI_PRE_BIG_SINK_INPUT: true", () => {
    let createDataItemsFromMessage

    beforeEach(() => {
      env.VI_PRE_BIG_SINK_INPUT = true
      env.VI_CAN_MESSAGE_BYTE_LENGTH = "16"
      setChannelDecoderConfigFileEnvs()
      createDataItemsFromMessage = getCreateDataItemFromMessageFn()
    })

    after(() => {
      clearEnv()
    })

    it("should decode and parse the message", () => {
      const parsedData = [
        {
          channel: "can_bms/e55",
          data_item_id: "BMS_2_Aux_Temp1-v1",
          data_item_name: "BMS_2_Aux_Temp1",
          device_uuid: "BEAGLE-ESS-4",
          sequence: 543232814,
          timestamp: "2020-04-19T22:12:43.055Z",
          value: 29.57
        },
        {
          channel: "can_bms/e55",
          data_item_id: "BMS_2_Aux_Temp2-v1",
          data_item_name: "BMS_2_Aux_Temp2",
          device_uuid: "BEAGLE-ESS-4",
          sequence: 543232814,
          timestamp: "2020-04-19T22:12:43.055Z",
          value: 29.67
        },
        {
          channel: "can_bms/e55",
          data_item_id: "BMS_2_Aux_Temp3-v1",
          data_item_name: "BMS_2_Aux_Temp3",
          device_uuid: "BEAGLE-ESS-4",
          sequence: 543232814,
          timestamp: "2020-04-19T22:12:43.055Z",
          value: 29.06
        },
        {
          channel: "can_bms/e55",
          data_item_id: "BMS_2_Aux_Temp4-v1",
          data_item_name: "BMS_2_Aux_Temp4",
          device_uuid: "BEAGLE-ESS-4",
          sequence: 543232814,
          timestamp: "2020-04-19T22:12:43.055Z",
          value: 29.21
        }
      ]
      const messageWithoutCanParsed = {attributes: CAN_BMS.attributes, data: [{canRaw: CAN_BMS.data[0].canRaw}]}
      expect(createDataItemsFromMessage({...messageWithoutCanParsed, probe})).to.eql(parsedData)
    })

    it("when config paths are not given, should return empty array", () => {
      env.VI_CAN_DECODER_CONFIG_PATH = undefined
      createDataItemsFromMessage = getCreateDataItemFromMessageFn()
      expect(createDataItemsFromMessage({...CAN_BMS, probe})).to.eql([])
    })
  })
})
