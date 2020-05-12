import {difference} from "ramda"
import {VCU, PRE_BIG_SINK_VCU} from "../../fixtures/bikeChannels/VCU"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"

describe("Parses VCU", () => {
  const {env} = process

  describe("VI_PRE_BIG_SINK_INPUT: false", () => {
    let createDataItemsFromMessage

    before(() => {
      env.VI_PRE_BIG_SINK_INPUT = "false"
      createDataItemsFromMessage = getCreateDataItemFromMessageFn()
    })

    after(() => {
      clearEnv()
    })

    it("parses given messages", () => {
      expect(createDataItemsFromMessage({...VCU, probe})).to.eql([
        {
          channel: "vcu",
          data_item_id: "bluetooth_device_status-v1",
          data_item_name: "bluetooth_device_status",
          device_uuid: "s_194",
          sequence: 6389,
          timestamp: "2019-10-12T21:23:13.027Z",
          value: 0
        },
        {
          channel: "vcu",
          data_item_id: "odometer-v1",
          data_item_name: "odometer",
          device_uuid: "s_194",
          sequence: 6389,
          timestamp: "2019-10-12T21:23:13.027Z",
          value: 221596
        },
        {
          channel: "vcu",
          data_item_id: "screen_brightness_control-v1",
          data_item_name: "screen_brightness_control",
          device_uuid: "s_194",
          sequence: 6389,
          timestamp: "2019-10-12T21:23:13.027Z",
          value: 0
        }
      ])
    })
  })

  describe("VI_PRE_BIG_SINK_INPUT: true", () => {
    let createDataItemsFromMessage

    beforeEach(() => {
      env.VI_PRE_BIG_SINK_INPUT = "true"
      env.VI_NUMBER_OF_BYTES_CAN = "268"
      setChannelDecoderConfigFileEnvs()
      createDataItemsFromMessage = getCreateDataItemFromMessageFn()
    })

    afterEach(() => {
      clearEnv()
    })

    it("should decode and parse message", () => {
      const requiredKeys = [
        "channel",
        "data_item_id",
        "data_item_name",
        "device_uuid",
        "sequence",
        "timestamp",
        "value"
      ]
      const parsedMessage = createDataItemsFromMessage({...PRE_BIG_SINK_VCU, probe})
      expect(parsedMessage.length).to.eql(22)
      parsedMessage.forEach(e => {
        expect(difference(requiredKeys, Object.keys(e)).length).to.eql(0)
      })
    })

    it("when config paths are not given, should return empty array", () => {
      env.VI_VCU_DECODER_CONFIG_PATH = undefined
      createDataItemsFromMessage = getCreateDataItemFromMessageFn()
      expect(createDataItemsFromMessage({...PRE_BIG_SINK_VCU, probe})).to.eql([])
    })
  })
})
