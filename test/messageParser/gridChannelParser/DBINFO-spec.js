import {DBINFO} from "../../fixtures/gridChannels/DBINFO"
import {getGridMessageParserFn} from "../../../src/messageParser/channelParser/gridChannelParser"
import probe from "../../fixtures/probe.json"
import {setChannelDecoderConfigFileEnvs} from "../../utils"
import {parseMessage} from "../../../src/messageParser/channelParser/utils/parseMessage"

describe("Parses DBINFO", () => {
  const {env} = process

  before(() => {
    env.VI_SHOULD_DECODE_MESSAGE = "false"
  })

  it("parses given messages", () => {
    setChannelDecoderConfigFileEnvs()
    const createDataItemsFromMessage = getGridMessageParserFn()
    const testData = parseMessage(DBINFO.data, DBINFO.attributes)

    expect(createDataItemsFromMessage({...DBINFO, probe})).to.eql(testData)
  })
})
