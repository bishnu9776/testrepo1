import {decodeCANMessage} from "../../src/messageParser/channelParser/channelDecoder/decodeCANMessage"
import {CAN_MCU, CAN_BMS, LEGACY_CAN_MCU, LEGACY_CAN_BMS} from "../fixtures/bikeChannels/CAN"
import {clearEnv} from "../utils"

describe("CAN decoder", () => {
  const {env} = process

  beforeEach(() => {
    env.VI_CAN_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/canDecoderConfig.json"
    env.VI_CAN_COMPONENT_VERSION_CONFIG_PATH = "./test/fixtures/configFiles/legacyComponentVersionConfig.json"
  })

  afterEach(() => {
    clearEnv()
  })
  it("should parse can data for can_mcu", () => {
    const parsedData = decodeCANMessage()(CAN_MCU)
    expect(parsedData).to.eql(CAN_MCU.data.map(e => e.parsed))
  })

  it("should parse can data for can_bms", () => {
    const parsedData = decodeCANMessage()(CAN_BMS)
    expect(parsedData).to.eql(CAN_BMS.data.map(e => e.parsed))
  })

  it("legacy bikes: should parse can data for can_mcu message using default parser config ", () => {
    const parsedData = decodeCANMessage()(LEGACY_CAN_MCU)
    expect(parsedData).to.eql(LEGACY_CAN_MCU.data.map(e => e.parsed))
  })

  it("legacy bikes: can_bms,should give empty array when canId is not present in default config ", () => {
    const parsedData = decodeCANMessage()(LEGACY_CAN_BMS)
    expect(parsedData).to.eql([[]])
  })
})
