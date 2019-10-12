import {parseChannelMessage} from "../../src/formatData/channelParser"
import {events} from "../mocks/events"
import probe from "../mocks/probe.json"

describe.skip("Parses events", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...events, probe})).to.eql([])
  })
})
