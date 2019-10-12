import {parseChannelMessage} from "../../src/formatData/channelParser"
import {CAN} from "../mocks/CAN"
import probe from "../mocks/probe.json"

describe("Parses GPSTPV", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...CAN, probe})).to.eql([])
  })
})
