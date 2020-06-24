import {PODINFO} from "../../fixtures/gridChannels/PODINFO"
import {getGridMessageParserFn} from "../../../src/messageParser/channelParser/gridChannelParser"
import probe from "../../fixtures/probe.json"
import {setChannelDecoderConfigFileEnvs} from "../../utils"
import {parseMessage} from "../../../src/messageParser/channelParser/utils/parseMessage"

describe("Parses PODINFO", () => {
  const {env} = process

  before(() => {
    env.VI_SHOULD_DECODE_MESSAGE = "false"
  })

  it("parses given messages", () => {
    setChannelDecoderConfigFileEnvs()
    const createDataItemsFromMessage = getGridMessageParserFn()
    const testData = parseMessage(PODINFO.data, PODINFO.attributes)

    expect(createDataItemsFromMessage({...PODINFO, probe})).to.eql(testData)
  })
})
