import {BIKEINFO} from "../mocks/BIKEINFO"
import {parseChannelMessage} from "../../src/formatData/channelParser"
import probe from "../mocks/probe.json"

describe("Parses BIKEINFO", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...BIKEINFO, probe})).to.eql([])
  })
})
