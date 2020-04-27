import {sortWith, prop, ascend} from "ramda"
import {canDecoder} from "../../src/messageParser/channelParser/channelDecoder/can-decoder"
import {canMcu, canBms, legacyCanMcu} from "../fixtures/bike-channels/CAN"
import canParserConfig from "../fixtures/bike-channels/can-parser-config.json"

describe("can parser", () => {
  const sortBasedOnKey = arr => sortWith([ascend(prop(["key"]))])(arr)
  const assertActualEqualsExpected = (response, expected) =>
    expect(sortBasedOnKey(response)).to.eql(sortBasedOnKey(expected))

  it("should parse can data for can_mcu", () => {
    const parsedData = canDecoder(canParserConfig)(canMcu)
    const expectedOutput = []
    canMcu.data.map(e => expectedOutput.push(...e.parsed))
    assertActualEqualsExpected(parsedData, expectedOutput)
  })

  it("should parse can data for can_bms", () => {
    const parsedData = canDecoder(canParserConfig)(canBms)
    assertActualEqualsExpected(parsedData, canBms.data[0].parsed)
  })

  it("legacy bikes: should parse can data for can_mcu message using default parser config ", () => {
    const parsedData = canDecoder(canParserConfig)(legacyCanMcu)
    const expectedOutput = []
    legacyCanMcu.data.map(e => expectedOutput.push(...e.parsed))
    assertActualEqualsExpected(parsedData, expectedOutput)
  })
})
