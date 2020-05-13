import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import {CAN, CAN_BMS} from "../../fixtures/bikeChannels/CAN"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"
import {formatParsedMessage} from "../../utils/formatParsedMessage"

describe("Parses CAN", () => {
  const {env} = process

  describe("should not decode message", () => {
    before(() => {
      env.VI_SHOULD_DECODE_MESSAGE = "false"
    })

    after(() => {
      clearEnv()
    })

    it("parses given messages without decoding", () => {
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
      const parsedMessage = [
        {
          data_item_id: "MCU_SOC-v1",
          data_item_name: "MCU_SOC",
          sequence: 347731,
          timestamp: "2019-10-05T18:26:31.477Z",
          value: 0
        },
        {
          data_item_id: "MCU_CHARGER_TYPE-v1",
          data_item_name: "MCU_CHARGER_TYPE",
          sequence: 347731,
          timestamp: "2019-10-05T18:26:31.477Z",
          value: 0
        },
        {
          data_item_id: "MCU_SOC-v1",
          data_item_name: "MCU_SOC",
          sequence: 347733,
          timestamp: "2019-10-05T18:26:31.978Z",
          value: 0
        },
        {
          data_item_id: "MCU_CHARGER_TYPE-v1",
          data_item_name: "MCU_CHARGER_TYPE",
          sequence: 347733,
          timestamp: "2019-10-05T18:26:31.978Z",
          value: 0
        }
      ].map(formatParsedMessage({channel: "can", device: "s_2404"}))
      expect(createDataItemsFromMessage({...CAN, probe})).to.eql(parsedMessage)
    })
  })

  describe("should decode message", () => {
    beforeEach(() => {
      env.VI_SHOULD_DECODE_MESSAGE = "true"
      env.VI_CAN_MESSAGE_BYTE_LENGTH = "16"
      setChannelDecoderConfigFileEnvs()
    })

    after(() => {
      clearEnv()
    })

    it("parses given message", () => {
      const parsedData = [
        {
          data_item_id: "BMS_2_Aux_Temp1-v1",
          data_item_name: "BMS_2_Aux_Temp1",
          value: 29.57
        },
        {
          data_item_id: "BMS_2_Aux_Temp2-v1",
          data_item_name: "BMS_2_Aux_Temp2",
          value: 29.67
        },
        {
          data_item_id: "BMS_2_Aux_Temp3-v1",
          data_item_name: "BMS_2_Aux_Temp3",
          value: 29.06
        },
        {
          data_item_id: "BMS_2_Aux_Temp4-v1",
          data_item_name: "BMS_2_Aux_Temp4",
          value: 29.21
        }
      ].map(
        formatParsedMessage({
          sequence: 543232814,
          timestamp: "2020-04-19T22:12:43.055Z",
          device: "BEAGLE-ESS-4",
          channel: "can_bms/e55"
        })
      )
      const messageWithoutCanParsed = {attributes: CAN_BMS.attributes, data: [{canRaw: CAN_BMS.data[0].canRaw}]}
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn()

      expect(createDataItemsFromMessage({...messageWithoutCanParsed, probe})).to.eql(parsedData)
    })

    it("when config paths are not given, should return empty array", () => {
      env.VI_CAN_DECODER_CONFIG_PATH = undefined
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
      expect(createDataItemsFromMessage({...CAN_BMS, probe})).to.eql([])
    })
  })
})
