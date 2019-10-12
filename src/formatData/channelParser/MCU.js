import {flatten} from "ramda"
import {getDataItem} from "./helpers"

// Can we rely on this being a whitelist or should we use a blacklist?
const eventAndSampleKeys = [
  "gps_power",
  "head_lamp_switch",
  "motor_previous_state",
  "high_beam",
  "kill_switch",
  "right_brake",
  "left_brake",
  "stop_lamp",
  "vcu_status",
  "right_scroll_switch",
  "gsm_1_8v",
  "horn_switch",
  "right_indicator_fault",
  "right_indicator_switch",
  "motor_power_status",
  "tail_lamp",
  "vehicle_current_state",
  "left_indicator_fault",
  "no_indicator_switch",
  "start_switch",
  "left_scroll_switch",
  "key_switch",
  "right_indicator_open_fault",
  "tail_lamp_fault",
  "charger_status",
  "position_lamp",
  "vehicle_previous_state",
  "left_indicator",
  "motor_current_state",
  "low_beam_fault",
  "motor_fan_fault",
  "bms_status",
  "right_indicator",
  "side_stand",
  "left_indicator_open_fault",
  "bms_key_in_status",
  "imu_power",
  "horn",
  "license_plate",
  "gsm_power",
  "low_beam",
  "high_beam_fault",
  "solenoid_feedback",
  "als_power",
  "ldu",
  "motor_fan",
  "left_indicator_switch"
]

export const parseMCU = ({data, attributes, probe}) => {
  return flatten(
    data.map(event => {
      const timestamp = new Date(event.timestamp * 1000).toISOString()
      return Object.keys(event)
        .filter(dataItemName => eventAndSampleKeys.includes(dataItemName))
        .map(dataItemName => {
          return getDataItem({probe, timestamp, attributes, dataItemName, value: event[dataItemName]})
        })
        .filter(e => !!e)
    })
  ).filter(e => !!e)
}
