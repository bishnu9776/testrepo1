import {difference} from "ramda"
import {MCU, PRE_BIG_SINK_MCU} from "../../fixtures/bikeChannels/MCU"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"

describe("Parses MCU", () => {
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
      expect(createDataItemsFromMessage({...MCU, probe})).to.eql([
        {
          channel: "mcu",
          data_item_id: "right_brake-v1",
          data_item_name: "right_brake",
          device_uuid: "s_248",
          sequence: 120468,
          timestamp: "2019-10-05T18:26:15.493Z",
          value: 0
        },
        {
          channel: "mcu",
          data_item_id: "left_brake-v1",
          data_item_name: "left_brake",
          device_uuid: "s_248",
          sequence: 120468,
          timestamp: "2019-10-05T18:26:15.493Z",
          value: 0
        },
        {
          channel: "mcu",
          data_item_id: "stop_lamp-v1",
          data_item_name: "stop_lamp",
          device_uuid: "s_248",
          sequence: 120468,
          timestamp: "2019-10-05T18:26:15.493Z",
          value: 0
        },
        {
          channel: "mcu",
          data_item_id: "vcu_status-v1",
          data_item_name: "vcu_status",
          device_uuid: "s_248",
          sequence: 120468,
          timestamp: "2019-10-05T18:26:15.493Z",
          value: 1
        }
      ])
    })
  })

  describe("VI_PRE_BIG_SINK_INPUT: true", () => {
    let createDataItemsFromMessage

    before(() => {
      env.VI_PRE_BIG_SINK_INPUT = "true"
      setChannelDecoderConfigFileEnvs()
      createDataItemsFromMessage = getCreateDataItemFromMessageFn()
    })

    after(() => {
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
      const parsedMessage = createDataItemsFromMessage({...PRE_BIG_SINK_MCU, probe})
      expect(parsedMessage.length).to.eql(47)
      parsedMessage.forEach(e => {
        expect(difference(requiredKeys, Object.keys(e)).length).to.eql(0)
      })
    })
  })
})
