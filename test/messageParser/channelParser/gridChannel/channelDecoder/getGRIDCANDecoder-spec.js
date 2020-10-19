import {getGRIDCANDecoder} from "../../../../../src/messageParser/channelParser/gridChannel/channelDecoder/getGRIDCANDecoder"
import {clearEnv} from "../../../../utils"
import {getMockMetricRegistry} from "../../../../stubs/getMockMetricRegistry"
import {CAN_RAW} from "../../../fixtures/gridChannels/preBigSink/CAN_RAW"

describe("GRID CAN decoder", () => {
  const {env} = process

  beforeEach(() => {
    env.VI_GRID_CAN_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/gridCanDecoderConfig.json"
    env.VI_GRID_CAN_MESSAGE_BYTE_LENGTH = "16"
  })

  afterEach(() => {
    clearEnv()
  })

  describe("Parse grid can data", () => {
    it("should decode can data for grid can", () => {
      expect(getGRIDCANDecoder(getMockMetricRegistry())(CAN_RAW)).to.eql([
        {
          can_id: "0x05e",
          db_id: "DB_001f7b100e99",
          global_seq: 49767849,
          key: "POD_AC_Voltage",
          pod_id: "0xfffe8",
          seq_num: 82121,
          timestamp: 1586189566.96,
          value: 241.094
        }
      ])
    })
  })
})
