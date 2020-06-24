import {difference} from "ramda"
import {MCU, PRE_BIG_SINK_MCU} from "../../fixtures/bikeChannels/MCU"
import {getVehicleMessageParserFn} from "../../../src/messageParser/channelParser/vehicleChannelParser"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"
import {getParsedMessageFn} from "../../utils/getParsedMessage"

describe("Parses MCU", () => {
  const {env} = process

  describe("should not decode message", () => {
    before(() => {
      env.VI_SHOULD_DECODE_MESSAGE = "false"
    })

    after(() => {
      clearEnv()
    })

    it("parses given messages", () => {
      const createDataItemsFromMessage = getVehicleMessageParserFn()
      const getParsedMessage = getParsedMessageFn("mcu", "s_248")
      const parsedMessage = [
        getParsedMessage("right_brake-v1", "right_brake", 0, 1, 1),
        getParsedMessage("left_brake-v1", "left_brake", 0, 1, 1),
        getParsedMessage("stop_lamp-v1", "stop_lamp", 0, 1, 1),
        getParsedMessage("vcu_status-v1", "vcu_status", 1, 1, 1)
      ]
      expect(createDataItemsFromMessage({...MCU, probe})).to.eql(parsedMessage)
    })
  })

  describe("should decode message", () => {
    beforeEach(() => {
      env.VI_SHOULD_DECODE_MESSAGE = "true"
      env.VI_MCU_MESSAGE_BYTE_LENGTH = "104"
      setChannelDecoderConfigFileEnvs()
    })

    afterEach(() => {
      clearEnv()
    })

    it("parses given message", () => {
      const requiredKeys = [
        "channel",
        "data_item_id",
        "data_item_name",
        "device_uuid",
        "sequence",
        "timestamp",
        "value"
      ]
      const createDataItemsFromMessage = getVehicleMessageParserFn()
      const parsedMessage = createDataItemsFromMessage({...PRE_BIG_SINK_MCU, probe})

      expect(parsedMessage.length).to.eql(47)
      parsedMessage.forEach(e => {
        expect(difference(requiredKeys, Object.keys(e)).length).to.eql(0)
      })
    })

    it("when config paths are not given, should return empty array", () => {
      env.VI_MCU_DECODER_CONFIG_PATH = undefined
      const createDataItemsFromMessage = getVehicleMessageParserFn()
      expect(createDataItemsFromMessage({...PRE_BIG_SINK_MCU, probe})).to.eql([])
    })
  })
})
