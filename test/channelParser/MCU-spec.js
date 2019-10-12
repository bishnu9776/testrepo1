import {MCU} from "../mocks/MCU"
import {parseChannelMessage} from "../../src/formatData/channelParser"
import probe from "../mocks/probe.json"

describe.skip("Parses MCU", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...MCU, probe})).to.eql([])
  })

  it("creates null events for missing keys")
})
