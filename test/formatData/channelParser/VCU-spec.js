import {VCU} from "../../mocks/VCU"
import {parseChannelMessage} from "../../../src/formatData/channelParser"
import probe from "../../mocks/probe.json"

describe.skip("Parses VCU", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...VCU, probe})).to.eql([])
  })
})
