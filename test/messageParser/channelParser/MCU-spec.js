import {difference} from "ramda"
import {MCU, PRE_BIG_SINK_MCU} from "../../fixtures/bikeChannels/MCU"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"
import {formatParsedMessage} from "../../utils/formatParsedMessage"

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
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
      const parsedMessage = [
        {
          data_item_id: "right_brake-v1",
          data_item_name: "right_brake",
          value: 0
        },
        {
          data_item_id: "left_brake-v1",
          data_item_name: "left_brake",
          value: 0
        },
        {
          data_item_id: "stop_lamp-v1",
          data_item_name: "stop_lamp",
          value: 0
        },
        {
          data_item_id: "vcu_status-v1",
          data_item_name: "vcu_status",
          value: 1
        }
      ].map(
        formatParsedMessage({sequence: 120468, timestamp: "2019-10-05T18:26:15.493Z", channel: "mcu", device: "s_248"})
      )
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
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
      const parsedMessage = createDataItemsFromMessage({...PRE_BIG_SINK_MCU, probe})

      expect(parsedMessage.length).to.eql(47)
      parsedMessage.forEach(e => {
        expect(difference(requiredKeys, Object.keys(e)).length).to.eql(0)
      })
    })

    it("when config paths are not given, should return empty array", () => {
      env.VI_MCU_DECODER_CONFIG_PATH = undefined
      const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
      expect(createDataItemsFromMessage({...PRE_BIG_SINK_MCU, probe})).to.eql([])
    })
  })
})
