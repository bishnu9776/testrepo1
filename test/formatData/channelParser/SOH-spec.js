import {SOH} from "../../mocks/SOH"
import {parseChannelMessage} from "../../../src/formatData/channelParser"
import probe from "../../mocks/probe.json"

describe.skip("Parses SOH", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...SOH, probe})).to.eql([])
  })
})
