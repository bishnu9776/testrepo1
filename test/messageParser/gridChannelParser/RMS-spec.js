import {RMSDATA} from "../../fixtures/gridChannels/RMSDATA"
import {getGridMessageParserFn} from "../../../src/messageParser/channelParser/gridChannelParser"
import probe from "../../fixtures/probe.json"
import {setChannelDecoderConfigFileEnvs} from "../../utils"
import {parseMessage} from "../../../src/messageParser/channelParser/utils/parseMessage"

describe("Parses RMS", () => {
  const {env} = process

  before(() => {
    env.VI_SHOULD_DECODE_MESSAGE = "true"
  })

  it("parses given messages", () => {
    setChannelDecoderConfigFileEnvs()
    const createDataItemsFromMessage = getGridMessageParserFn()
    const testData = parseMessage(RMSDATA.parsed, RMSDATA.attributes)
    expect(createDataItemsFromMessage({...RMSDATA, probe})).to.eql(testData)
  })
})
