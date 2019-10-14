import {parseChannelMessage} from "../../../src/formatData/channelParser"
import {EVENTS} from "../../mocks/EVENTS"
import probe from "../../mocks/probe.json"

describe.skip("Parses EVENTS", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...EVENTS, probe})).to.eql([])
  })
})
