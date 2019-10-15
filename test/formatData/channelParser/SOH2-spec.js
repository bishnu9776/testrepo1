import {SOH2} from "../../mocks/SOH2"
import {parseChannelMessage} from "../../../src/formatData/channelParser"
import probe from "../../mocks/probe.json"

describe.skip("Parses SOH2", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...SOH2, probe})).to.eql([])
  })
})
