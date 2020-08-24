import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import {CAN_BMS} from "../../fixtures/bikeChannels/CAN"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"
import {getParsedMessageFn, getParserCANRawMessageFn} from "../../utils/getParsedMessage"
import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"
import {clearStub} from "../../stubs/clearStub"

describe("Parses CAN", () => {
  const {env} = process

  describe("should decode message", () => {
    let metricRegistry

    beforeEach(() => {
      env.VI_SHOULD_DECODE_MESSAGE = "true"
      env.VI_CAN_MESSAGE_BYTE_LENGTH = "16"
      setChannelDecoderConfigFileEnvs()
      metricRegistry = getMockMetricRegistry()
    })

    after(() => {
      clearEnv()
      clearStub()
    })

    it("parses given message", () => {
      const getParsedMessage = getParsedMessageFn("can_bms/e55", "BEAGLE-ESS-4", "0x158")
      const getCANRawMessage = getParserCANRawMessageFn("can_bms/e55", "BEAGLE-ESS-4", 1)

      const parsedData = [
        getParsedMessage("BMS_2_Aux_Temp1-v1", "BMS_2_Aux_Temp1", 29.57, 1, 1),
        getParsedMessage("BMS_2_Aux_Temp2-v1", "BMS_2_Aux_Temp2", 29.67, 1, 1),
        getParsedMessage("BMS_2_Aux_Temp3-v1", "BMS_2_Aux_Temp3", 29.06, 1, 1),
        getParsedMessage("BMS_2_Aux_Temp4-v1", "BMS_2_Aux_Temp4", 29.21, 1, 1),
        getCANRawMessage({
          bike_id: "BEAGLE-ESS-4",
          can_id: "344",
          data: "10163383059102787851",
          seq_num: 1,
          timestamp: 1
        })
      ]
      const messageWithoutCanParsed = {attributes: CAN_BMS.attributes, data: CAN_BMS.data}
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn(metricRegistry)

      expect(createDataItemsFromMessage({...messageWithoutCanParsed, probe})).to.eql(parsedData)
    })

    it("when config paths are not given, should return can raw message", () => {
      env.VI_CAN_DECODER_CONFIG_PATH = undefined
      const getCANRawMessage = getParserCANRawMessageFn("can_bms/e55", "BEAGLE-ESS-4", 1)

      const createDataItemsFromMessage = getCreateDataItemFromMessageFn(metricRegistry)
      expect(createDataItemsFromMessage({...CAN_BMS, probe})).to.eql([
        getCANRawMessage({
          bike_id: "BEAGLE-ESS-4",
          can_id: "344",
          data: "10163383059102787851",
          seq_num: 1,
          timestamp: 1
        })
      ])
    })
  })
})
