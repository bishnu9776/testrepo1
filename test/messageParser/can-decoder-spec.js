import {sortWith, prop, ascend, flatten} from "ramda"
import {canDecoder} from "../../src/messageParser/channelParser/channelDecoder/can-decoder"
import {canMcu, canBms, legacyCanMcu} from "../fixtures/bike-channels/CAN"
import canParserConfig from "../fixtures/bike-channels/can-parser-config.json"
import componentVersionConfig from "../fixtures/bike-channels/component-version-config.json"

describe("can decoder", () => {
  const sortBasedOnKey = arr => sortWith([ascend(prop(["key"]))])(arr)
  const assertActualEqualsExpected = (response, expected) =>
    expect(sortBasedOnKey(response)).to.eql(sortBasedOnKey(expected))

  it("should parse can data for can_mcu", () => {
    const parsedData = canDecoder(canParserConfig, componentVersionConfig)(canMcu)
    assertActualEqualsExpected(parsedData, flatten(canMcu.data.map(e => e.parsed)))
  })

  it("should parse can data for can_bms", () => {
    const parsedData = canDecoder(canParserConfig, componentVersionConfig)(canBms)
    assertActualEqualsExpected(parsedData, flatten(canBms.data.map(e => e.parsed)))
  })

  it("legacy bikes: should parse can data for can_mcu message using default parser config ", () => {
    const parsedData = canDecoder(canParserConfig, componentVersionConfig)(legacyCanMcu)
    assertActualEqualsExpected(parsedData, flatten(legacyCanMcu.data.map(e => e.parsed)))
  })
})
