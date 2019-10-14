import {GPSTPV} from "../../mocks/GPSTPV"
import {parseChannelMessage} from "../../../src/formatData/channelParser"
import probe from "../../mocks/probe.json"

describe.skip("Parses GPSTPV", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...GPSTPV, probe})).to.eql([])
  })

  it("creates null events for missing keys")
})
