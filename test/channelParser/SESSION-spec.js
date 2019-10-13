import {SESSION} from "../mocks/SESSION"
import {parseChannelMessage} from "../../src/formatData/channelParser"
import probe from "../mocks/probe.json"

describe.skip("Parses SESSION", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...SESSION, probe})).to.eql([])
  })
})
