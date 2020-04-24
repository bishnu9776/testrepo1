import {sortWith, prop, ascend} from "ramda"
import {canParser} from "../../src/messageParser/channelParser/can-parser"
import {canMcu, canBms, legacyCanMcu} from "../fixtures/bike-channels/CAN"
import canParserConfig from "../fixtures/bike-channels/can-parser-config.json"

describe("can parser", () => {
  const sortBasedOnKey = arr => sortWith([ascend(prop(["key"]))])(arr)
  const assertActualEqualsExpected = (response, expected) =>
    expect(sortBasedOnKey(response)).to.eql(sortBasedOnKey(expected))

  it("should parse can data for can_mcu", () => {
    const parsedData = canParser(canParserConfig)(canMcu)
    const expectedOutput = []
    canMcu.data.map(e => expectedOutput.push(...e.parsed))
    assertActualEqualsExpected(parsedData, expectedOutput)
  })

  it("should parse can data for can_bms", () => {
    const parsedData = canParser(canParserConfig)(canBms)
    assertActualEqualsExpected(parsedData, canBms.data[0].parsed)
  })

  it("legacy bikes: should parse can data for can_mcu message using default parser config ", () => {
    const parsedData = canParser(canParserConfig)(legacyCanMcu)
    const expectedOutput = []
    legacyCanMcu.data.map(e => expectedOutput.push(...e.parsed))
    assertActualEqualsExpected(parsedData, expectedOutput)
  })

  // it("should parse data - big file", () => {
  //   const input = require("../../output")
  //   const parsedData = canParser(canParserConfig)(input)
  //   const expectedOutput = []
  //   input.data.map(e => expectedOutput.push(...e.parsed))
  //   assertActualEqualsExpected(parsedData, expectedOutput)
  // })
})
