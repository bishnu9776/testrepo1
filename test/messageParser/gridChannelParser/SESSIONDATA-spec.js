import {SESSIONDATA} from "../../fixtures/gridChannels/SESSIONDATA"
import {getGridMessageParserFn} from "../../../src/messageParser/channelParser/gridChannelParser"
import probe from "../../fixtures/probe.json"
import {setChannelDecoderConfigFileEnvs} from "../../utils"
import {parseMessage} from "../../../src/messageParser/channelParser/utils/parseMessage"

describe("Parses SESSIONDATA", () => {
  const {env} = process

  before(() => {
    env.VI_SHOULD_DECODE_MESSAGE = "false"
  })

  it("parses given messages", () => {
    setChannelDecoderConfigFileEnvs()
    const createDataItemsFromMessage = getGridMessageParserFn()
    const testData = parseMessage(SESSIONDATA.data, SESSIONDATA.attributes)

    expect(createDataItemsFromMessage({...SESSIONDATA, probe})).to.eql(testData)
  })
})
