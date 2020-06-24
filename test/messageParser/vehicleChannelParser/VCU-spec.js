import {difference} from "ramda"
import {VCU, PRE_BIG_SINK_VCU} from "../../fixtures/bikeChannels/VCU"
import {getVehicleMessageParserFn} from "../../../src/messageParser/channelParser/vehicleChannelParser"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"
import {getParsedMessageFn} from "../../utils/getParsedMessage"

describe("Parses VCU", () => {
  const {env} = process

  describe("should not decode message", () => {
    before(() => {
      env.VI_SHOULD_DECODE_MESSAGE = "false"
    })

    after(() => {
      clearEnv()
    })

    it("parses given messages", () => {
      const getParsedMessage = getParsedMessageFn("vcu", "s_194")
      const parsedMessage = [
        getParsedMessage("bluetooth_device_status-v1", "bluetooth_device_status", 0, 1, 1),
        getParsedMessage("odometer-v1", "odometer", 1000, 1, 1),
        getParsedMessage("screen_brightness_control-v1", "screen_brightness_control", 0, 1, 1)
      ]
      const createDataItemsFromMessage = getVehicleMessageParserFn()
      expect(createDataItemsFromMessage({...VCU, probe})).to.eql(parsedMessage)
    })
  })

  describe("should decode mesage", () => {
    beforeEach(() => {
      env.VI_SHOULD_DECODE_MESSAGE = "true"
      env.VI_VCU_MESSAGE_BYTE_LENGTH = "64"
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

      const parsedMessage = createDataItemsFromMessage({...PRE_BIG_SINK_VCU, probe})
      expect(parsedMessage.length).to.eql(22)
      parsedMessage.forEach(e => {
        expect(difference(requiredKeys, Object.keys(e)).length).to.eql(0)
      })
    })

    it("when config paths are not given, should return empty array", () => {
      env.VI_VCU_DECODER_CONFIG_PATH = undefined
      const createDataItemsFromMessage = getVehicleMessageParserFn()
      expect(createDataItemsFromMessage({...PRE_BIG_SINK_VCU, probe})).to.eql([])
    })
  })
})
