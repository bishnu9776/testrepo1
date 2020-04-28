import {decodeCANMessage} from "../../src/messageParser/channelParser/channelDecoder/decodeCANMessage"
import {canMcu, canBms, legacyCanMcu, legacyCanBms} from "../fixtures/bikeChannels/CAN"
import canDecoderConfig from "../fixtures/configFiles/canDecoderConfig.json"
import legacyComponentVersionConfig from "../fixtures/configFiles/legacyComponentVersionConfig.json"

describe("can decoder", () => {
  it("should parse can data for can_mcu", () => {
    const parsedData = decodeCANMessage(canDecoderConfig, legacyComponentVersionConfig)(canMcu)
    expect(parsedData).to.eql(canMcu.data.map(e => e.parsed))
  })

  it("should parse can data for can_bms", () => {
    const parsedData = decodeCANMessage(canDecoderConfig, legacyComponentVersionConfig)(canBms)
    expect(parsedData).to.eql(canBms.data.map(e => e.parsed))
  })

  it("legacy bikes: should parse can data for can_mcu message using default parser config ", () => {
    const parsedData = decodeCANMessage(canDecoderConfig, legacyComponentVersionConfig)(legacyCanMcu)
    expect(parsedData).to.eql(legacyCanMcu.data.map(e => e.parsed))
  })

  it("legacy bikes: can_bms,should give empty array when canId is not present in default config ", () => {
    const parsedData = decodeCANMessage(canDecoderConfig, legacyComponentVersionConfig)(legacyCanBms)
    expect(parsedData).to.eql([[]])
  })
})
