import {parseChannelMessage} from "../../../src/formatData/channelParser"
import {HEMAN} from "../../mocks/HEMAN"
import probe from "../../mocks/probe.json"

describe.skip("Parses HEMAN", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...HEMAN, probe})).to.eql([])
  })
})
