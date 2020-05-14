import {getCANDecoder} from "../../../../src/messageParser/channelParser/channelDecoder/getCANDecoder"
import {CAN_MCU, CAN_BMS, LEGACY_CAN_MCU, LEGACY_CAN_BMS} from "../../../fixtures/bikeChannels/CAN"
import {clearEnv} from "../../../utils"

describe("CAN decoder", () => {
  const {env} = process

  beforeEach(() => {
    env.VI_CAN_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/canDecoderConfig.json"
    env.VI_CAN_LEGACY_COMPONENT_VERSION_CONFIG_PATH = "./test/fixtures/configFiles/legacyComponentVersionConfig.json"
    env.VI_CAN_MESSAGE_BYTE_LENGTH = "16"
  })

  afterEach(() => {
    clearEnv()
  })

  describe("latest bikes", () => {
    it("should decode can data for can_mcu", () => {
      const parsedData = getCANDecoder()(CAN_MCU)
      expect(parsedData).to.eql(CAN_MCU.data.map(e => e.parsed))
    })

    it("should decode can data for can_bms", () => {
      const parsedData = getCANDecoder()(CAN_BMS)
      expect(parsedData).to.eql(CAN_BMS.data.map(e => e.parsed))
    })
  })

  describe("legacy bikes", () => {
    describe("when device is present in legacy decoder config", () => {
      it("should decode message using bike specific config in legacy decoder config", () => {
        const parsedData = getCANDecoder()(LEGACY_CAN_BMS)
        expect(parsedData).to.eql(LEGACY_CAN_BMS.data.map(e => e.parsed))
      })
    })

    describe("when device is not present in legacy decoder config", () => {
      it("should decode message using default config in legacy decoder config", () => {
        const parsedData = getCANDecoder()(LEGACY_CAN_MCU)
        expect(parsedData).to.eql(LEGACY_CAN_MCU.data.map(e => e.parsed))
      })

      it("should give empty array when canId is not present in legacy decoder config ", () => {
        const message = {
          attributes: {...LEGACY_CAN_BMS.attributes, bike_id: "bike1"},
          data: LEGACY_CAN_BMS.data
        }

        const parsedData = getCANDecoder()(message)
        expect(parsedData).to.eql([[]])
      })
    })
  })
})
