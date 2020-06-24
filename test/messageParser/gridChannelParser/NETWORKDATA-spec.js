import {NETWORKDATA} from "../../fixtures/gridChannels/NETWORKDATA"
import {getGridMessageParserFn} from "../../../src/messageParser/channelParser/gridChannelParser"
import probe from "../../fixtures/probe.json"
import {setChannelDecoderConfigFileEnvs} from "../../utils"
import {parseMessage} from "../../../src/messageParser/channelParser/utils/parseMessage"

describe("Parses NETWORKDATA", () => {
  const {env} = process

  before(() => {
    env.VI_SHOULD_DECODE_MESSAGE = "false"
  })

  it("parses given messages", () => {
    setChannelDecoderConfigFileEnvs()
    const createDataItemsFromMessage = getGridMessageParserFn()
    const testData = parseMessage(NETWORKDATA.data, NETWORKDATA.attributes)

    expect(createDataItemsFromMessage({...NETWORKDATA, probe})).to.eql(testData)
  })
})
