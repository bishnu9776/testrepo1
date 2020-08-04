import {difference} from "ramda"
import {PRE_BIG_SINK_VCU} from "../../fixtures/bikeChannels/VCU"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"

describe("Parses VCU", () => {
  const {env} = process

  beforeEach(() => {
    env.VI_SHOULD_DECODE_MESSAGE = "true"
    env.VI_VCU_MESSAGE_BYTE_LENGTH = "64"
    setChannelDecoderConfigFileEnvs()
  })

  afterEach(() => {
    clearEnv()
  })

  it("parses given message", () => {
    const requiredKeys = ["channel", "data_item_id", "data_item_name", "device_uuid", "sequence", "timestamp", "value"]
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
