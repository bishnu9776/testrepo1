import {difference} from "ramda"
import {VCU, PRE_BIG_SINK_VCU} from "../../fixtures/bikeChannels/VCU"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"
import {formatParsedMessage} from "../../utils/formatParsedMessage"

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
      const parsedMessage = [
        {
          data_item_id: "bluetooth_device_status-v1",
          data_item_name: "bluetooth_device_status",
          value: 0
        },
        {
          data_item_id: "odometer-v1",
          data_item_name: "odometer",
          value: 221596
        },
        {
          data_item_id: "screen_brightness_control-v1",
          data_item_name: "screen_brightness_control",
          value: 0
        }
      ].map(
        formatParsedMessage({sequence: 6389, timestamp: "2019-10-12T21:23:13.027Z", device: "s_194", channel: "vcu"})
      )
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
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
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn()

      const parsedMessage = createDataItemsFromMessage({...PRE_BIG_SINK_VCU, probe})
      expect(parsedMessage.length).to.eql(22)
      parsedMessage.forEach(e => {
        expect(difference(requiredKeys, Object.keys(e)).length).to.eql(0)
      })
    })

    it("when config paths are not given, should return empty array", () => {
      env.VI_VCU_DECODER_CONFIG_PATH = undefined
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
      expect(createDataItemsFromMessage({...PRE_BIG_SINK_VCU, probe})).to.eql([])
    })
  })
})
