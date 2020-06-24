import {getGridMessageParserFn} from "../../../src/messageParser/channelParser/gridChannelParser"
import {CAN as GRIDCAN} from "../../fixtures/gridChannels/CAN"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"

describe("Parses GRID CAN", () => {
  const {env} = process

  describe("should decode message", () => {
    beforeEach(() => {
      env.VI_SHOULD_DECODE_MESSAGE = "true"
      env.VI_CAN_MESSAGE_BYTE_LENGTH = "16"
      setChannelDecoderConfigFileEnvs()
    })

    after(() => {
      clearEnv()
    })

    it("parse keys", () => {
      const createDataItemsFromMessage = getGridMessageParserFn()
      expect(createDataItemsFromMessage({...GRIDCAN, probe})).to.eql([
        {
          channel: "can",
          data_item_id: "POD_AC_Voltage-v1",
          data_item_name: "POD_AC_Voltage",
          device_uuid: "DB_001f7b100e91",
          sequence: 82121,
          timestamp: "2020-04-06T16:12:46.960Z",
          value: 241.094
        }
      ])
    })
  })
})
