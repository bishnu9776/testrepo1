import {canDecoder} from "../../src/messageParser/channelParser/channelDecoder/can-decoder"
import {canMcu, canBms, legacyCanMcu} from "../fixtures/bike-channels/CAN"
import canParserConfig from "../fixtures/bike-channels/can-parser-config.json"
import componentVersionConfig from "../fixtures/bike-channels/component-version-config.json"

describe("can decoder", () => {
  it("should parse can data for can_mcu", () => {
    const parsedData = canDecoder(canParserConfig, componentVersionConfig)(canMcu)
    expect(parsedData).to.eql(canMcu.data.map(e => e.parsed))
  })

  it("should parse can data for can_bms", () => {
    const parsedData = canDecoder(canParserConfig, componentVersionConfig)(canBms)
    expect(parsedData).to.eql(canBms.data.map(e => e.parsed))
  })

  it("legacy bikes: should parse can data for can_mcu message using default parser config ", () => {
    const parsedData = canDecoder(canParserConfig, componentVersionConfig)(legacyCanMcu)
    expect(parsedData).to.eql(legacyCanMcu.data.map(e => e.parsed))
  })
})
