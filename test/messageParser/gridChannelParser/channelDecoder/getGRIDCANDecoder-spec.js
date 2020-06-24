import {getGRIDCANDecoder} from "../../../../src/messageParser/channelParser/gridChannelParser/channelDecoder/getGRIDCANDecoder"
import {CAN} from "../../../fixtures/gridChannels/CAN"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../../utils"

describe("GRID CAN decoder", () => {
  const {env} = process

  beforeEach(() => {
    env.VI_CAN_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/gridcanDecoderConfig.json"
    env.VI_CAN_MESSAGE_BYTE_LENGTH = "16"
    setChannelDecoderConfigFileEnvs()
  })

  afterEach(() => {
    clearEnv()
  })

  describe("Parse grid can data", () => {
    it("should decode can data for grid can", () => {
      const parsedData = getGRIDCANDecoder()(CAN)
      expect(parsedData).to.eql(CAN.data.map(e => e.parsed))
    })
  })
})
