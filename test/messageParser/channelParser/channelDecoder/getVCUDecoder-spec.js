import {dissoc} from "ramda"
import {PRE_BIG_SINK_VCU} from "../../../fixtures/bikeChannels/VCU"
import {clearEnv} from "../../../utils"
import {getVCUDecoder} from "../../../../src/messageParser/channelParser/channelDecoder/getVCUDecoder"

describe("VCU decoder", () => {
  const {env} = process
  before(() => {
    env.VI_PRE_BIG_SINK_INPUT = "true"
    env.VI_VCU_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/vcuDecoderConfig.js"
    env.VI_NUMBER_OF_BYTES_VCU = "64"
  })

  after(() => {
    clearEnv()
  })

  it("should decode VCU message", () => {
    const decodedDataItems = {
      touch_fault: 0,
      gps_power_fault: 0,
      bluetooth_device_status: 0,
      odometer: 36218141,
      screen_brightness_control: 0,
      imu_fault: 0,
      als_fault: 0,
      cpu_thermal_zone0: 27,
      incognito_mode: 0,
      ddr_temperature: 36,
      screen_brightness: 2,
      buck_temperature: 34,
      als_lux: -1,
      lcd_backlight_fault: 0,
      vehicle_range: 39,
      ldu_fault: 0,
      network_signal: 74,
      touchscreen_status: 0,
      network_status: 0,
      gsm_temperature: 35,
      lcd_power_fault: 0,
      display_status: 0
    }
    const expected = {...decodedDataItems, ...dissoc("data", PRE_BIG_SINK_VCU.data[0])}

    const parsedData = getVCUDecoder()(PRE_BIG_SINK_VCU)
    expect(parsedData).to.eql([expected])
  })
})
