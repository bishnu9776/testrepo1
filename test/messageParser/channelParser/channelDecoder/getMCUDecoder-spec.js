import {dissoc} from "ramda"
import {PRE_BIG_SINK_MCU} from "../../../fixtures/bikeChannels/MCU"
import {getMCUDecoder} from "../../../../src/messageParser/channelParser/channelDecoder/getMCUDecoder"
import {clearEnv} from "../../../utils"

describe("MCU decoder", () => {
  const {env} = process
  before(() => {
    env.VI_PRE_BIG_SINK_INPUT = "true"
    env.VI_MCU_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/mcuDecoderConfig.js"
    env.VI_NUMBER_OF_BYTES_MCU = "104"
  })

  after(() => {
    clearEnv()
  })

  it("should decode MCU message", () => {
    const decodedDataItems = {
      gps_power: 1,
      head_lamp_switch: 0,
      motor_previous_state: 2,
      high_beam: 0,
      kill_switch: 1,
      right_brake: 0,
      left_brake: 1,
      stop_lamp: 1,
      vcu_status: 1,
      right_scroll_switch: 0,
      gsm_1_8v: 0,
      horn_switch: 0,
      right_indicator_fault: 0,
      right_indicator_switch: 0,
      motor_power_status: 1,
      tail_lamp: 1,
      vehicle_current_state: 3,
      left_indicator_fault: 0,
      no_indicator_switch: 0,
      start_switch: 0,
      left_scroll_switch: 0,
      key_switch: 1,
      right_indicator_open_fault: 0,
      tail_lamp_fault: 0,
      charger_status: 0,
      position_lamp: 1,
      vehicle_previous_state: 3,
      left_indicator: 0,
      motor_current_state: 1,
      low_beam_fault: 0,
      motor_fan_fault: 0,
      bms_status: 1,
      right_indicator: 0,
      side_stand: 1,
      left_indicator_open_fault: 0,
      bms_key_in_status: 1,
      imu_power: 1,
      horn: 0,
      license_plate: 1,
      gsm_power: 1,
      low_beam: 1,
      high_beam_fault: 0,
      solenoid_feedback: 0,
      als_power: 1,
      ldu: 1,
      motor_fan: 0,
      left_indicator_switch: 0
    }
    const expected = {...decodedDataItems, ...dissoc("data", PRE_BIG_SINK_MCU.data[0])}

    const parsedData = getMCUDecoder()(PRE_BIG_SINK_MCU)
    expect(parsedData).to.eql([expected])
  })
})
