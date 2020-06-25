import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import {CAN, CAN_BMS} from "../../fixtures/bikeChannels/CAN"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"
import {getParsedMessageFn} from "../../utils/getParsedMessage"
import {metricRegistry} from "../../stubs/metricRegistry"

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
      const getParsedMessage = getParsedMessageFn("can", "s_2404", "0x100")
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
      const parsedMessage = [
        getParsedMessage("MCU_SOC-v1", "MCU_SOC", 0, 1, 0),
        getParsedMessage("MCU_CHARGER_TYPE-v1", "MCU_CHARGER_TYPE", 0, 1, 0),
        getParsedMessage("MCU_SOC-v1", "MCU_SOC", 0, 3, 1),
        getParsedMessage("MCU_CHARGER_TYPE-v1", "MCU_CHARGER_TYPE", 0, 3, 1)
      ]
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
      const getParsedMessage = getParsedMessageFn("can_bms/e55", "BEAGLE-ESS-4", "0x158")

      const parsedData = [
        getParsedMessage("BMS_2_Aux_Temp1-v1", "BMS_2_Aux_Temp1", 29.57, 1, 1),
        getParsedMessage("BMS_2_Aux_Temp2-v1", "BMS_2_Aux_Temp2", 29.67, 1, 1),
        getParsedMessage("BMS_2_Aux_Temp3-v1", "BMS_2_Aux_Temp3", 29.06, 1, 1),
        getParsedMessage("BMS_2_Aux_Temp4-v1", "BMS_2_Aux_Temp4", 29.21, 1, 1)
      ]
      const messageWithoutCanParsed = {attributes: CAN_BMS.attributes, data: [{canRaw: CAN_BMS.data[0].canRaw}]}
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn(metricRegistry)

      expect(createDataItemsFromMessage({...messageWithoutCanParsed, probe})).to.eql(parsedData)
    })

    it("when config paths are not given, should return empty array", () => {
      env.VI_CAN_DECODER_CONFIG_PATH = undefined
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn(metricRegistry)
      expect(createDataItemsFromMessage({...CAN_BMS, probe})).to.eql([])
    })
  })
})
