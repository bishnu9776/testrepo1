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
          can_id: 112,
          db_id: "DB_001f7b10161e",
          global_seq: 79869961,
          key: "POD_S340_ChargerType",
          pod_id: "0xfffa4",
          seq_num: 3788817,
          timestamp: 1603360016.341,
          value: 2
        },
        {
          can_id: 112,
          db_id: "DB_001f7b10161e",
          global_seq: 79869961,
          key: "POD_S340_McuChargingState",
          pod_id: "0xfffa4",
          seq_num: 3788817,
          timestamp: 1603360016.341,
          value: 32
        }
      ])
    })
  })
})
