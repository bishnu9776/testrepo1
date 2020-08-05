import {difference} from "ramda"
import {MCU} from "../../fixtures/bikeChannels/MCU"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../utils"

describe("Parses MCU", () => {
  const {env} = process

  beforeEach(() => {
    env.VI_MCU_MESSAGE_BYTE_LENGTH = "104"
    setChannelDecoderConfigFileEnvs()
  })

  afterEach(() => {
    clearEnv()
  })

  it("parses given message", () => {
    const requiredKeys = ["channel", "data_item_id", "data_item_name", "device_uuid", "sequence", "timestamp", "value"]
    const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
    const parsedMessage = createDataItemsFromMessage({...MCU, probe})

    expect(parsedMessage.length).to.eql(47)
    parsedMessage.forEach(e => {
      expect(difference(requiredKeys, Object.keys(e)).length).to.eql(0)
    })
  })

  it("when config paths are not given, should return empty array", () => {
    env.VI_MCU_DECODER_CONFIG_PATH = undefined
    const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
    expect(createDataItemsFromMessage({...MCU, probe})).to.eql([])
  })
})
