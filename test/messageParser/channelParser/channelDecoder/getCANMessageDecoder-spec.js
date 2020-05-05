import {getCANMessageDecoder} from "../../../../src/messageParser/channelParser/channelDecoder/getCANMessageDecoder"
import {CAN_MCU, CAN_BMS, LEGACY_CAN_MCU, LEGACY_CAN_BMS} from "../../../fixtures/bikeChannels/CAN"
import {clearEnv} from "../../../utils"

describe("CAN decoder", () => {
  const {env} = process

  beforeEach(() => {
    env.VI_CAN_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/canDecoderConfig.json"
    env.VI_CAN_LEGACY_COMPONENT_VERSION_CONFIG_PATH = "./test/fixtures/configFiles/legacyComponentVersionConfig.json"
  })

  afterEach(() => {
    clearEnv()
  })

  describe("latest bikes", () => {
    it("should parse can data for can_mcu", () => {
      const parsedData = getCANMessageDecoder()(CAN_MCU)
      expect(parsedData).to.eql(CAN_MCU.data.map(e => e.parsed))
    })

    it("should parse can data for can_bms", () => {
      const parsedData = getCANMessageDecoder()(CAN_BMS)
      expect(parsedData).to.eql(CAN_BMS.data.map(e => e.parsed))
    })
  })

  describe("legacy bikes", () => {
    it("should parse can data for can_mcu message using default parser config ", () => {
      const parsedData = getCANMessageDecoder()(LEGACY_CAN_MCU)
      expect(parsedData).to.eql(LEGACY_CAN_MCU.data.map(e => e.parsed))
    })

    it("should give empty array when canId is not present in default parser config ", () => {
      const message = {
        attributes: {...LEGACY_CAN_BMS.attributes, bike_id: "bike1"},
        data: LEGACY_CAN_BMS.data
      }

      const parsedData = getCANMessageDecoder()(message)
      expect(parsedData).to.eql([[]])
    })
  })

  describe("bikes with specific configs", () => {
    it("BEAGLE-ESS-4 - should deecode using bike specific config in default parser config ", () => {
      const parsedData = getCANMessageDecoder()(LEGACY_CAN_BMS)
      expect(parsedData).to.eql(LEGACY_CAN_BMS.data.map(e => e.parsed))
    })
  })
})
