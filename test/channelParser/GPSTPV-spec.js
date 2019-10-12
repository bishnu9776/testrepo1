import {GPSTPV} from "../mocks/GPSTPV"
import {parseChannelMessage} from "../../src/formatData/channelParser"

describe("Parses GPSTPV", () => {
  const probe = {}

  it("parses given messages", () => {
    expect(parseChannelMessage({...GPSTPV, probe}))
  })

  it("creates null events for missing keys")
})
