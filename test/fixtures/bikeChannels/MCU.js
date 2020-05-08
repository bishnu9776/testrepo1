export const MCU = {
  attributes: {
    version: "v1",
    channel: "mcu",
    bike_id: "s_248"
  },
  data: [
    {
      seq_num: 120468,
      timestamp: 1570299975.493,
      right_brake: 0,
      left_brake: 0,
      stop_lamp: 0,
      vcu_status: 1,
      data: "00000000000000000000000000010101010100000000000000000000000000000000000000000101010004040101000002060000",
      global_seq: 501616790,
      bike_id: "s_248"
    }
  ]
}

export const decodedData = {
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

export const parsedData = [
  {
    channel: "mcu",
    data_item_id: "left_brake-v1",
    data_item_name: "left_brake",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "right_brake-v1",
    data_item_name: "right_brake",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "head_lamp_switch-v1",
    data_item_name: "head_lamp_switch",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "horn_switch-v1",
    data_item_name: "horn_switch",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "left_indicator_switch-v1",
    data_item_name: "left_indicator_switch",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "right_indicator_switch-v1",
    data_item_name: "right_indicator_switch",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "no_indicator_switch-v1",
    data_item_name: "no_indicator_switch",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "key_switch-v1",
    data_item_name: "key_switch",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "start_switch-v1",
    data_item_name: "start_switch",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "left_scroll_switch-v1",
    data_item_name: "left_scroll_switch",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "right_scroll_switch-v1",
    data_item_name: "right_scroll_switch",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "side_stand-v1",
    data_item_name: "side_stand",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "ldu-v1",
    data_item_name: "ldu",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "solenoid_feedback-v1",
    data_item_name: "solenoid_feedback",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "gsm_power-v1",
    data_item_name: "gsm_power",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "gps_power-v1",
    data_item_name: "gps_power",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "als_power-v1",
    data_item_name: "als_power",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "imu_power-v1",
    data_item_name: "imu_power",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "motor_fan-v1",
    data_item_name: "motor_fan",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "low_beam-v1",
    data_item_name: "low_beam",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "high_beam-v1",
    data_item_name: "high_beam",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "tail_lamp-v1",
    data_item_name: "tail_lamp",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "stop_lamp-v1",
    data_item_name: "stop_lamp",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "horn-v1",
    data_item_name: "horn",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "left_indicator-v1",
    data_item_name: "left_indicator",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "right_indicator-v1",
    data_item_name: "right_indicator",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "position_lamp-v1",
    data_item_name: "position_lamp",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "license_plate-v1",
    data_item_name: "license_plate",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "high_beam_fault-v1",
    data_item_name: "high_beam_fault",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "low_beam_fault-v1",
    data_item_name: "low_beam_fault",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "left_indicator_open_fault-v1",
    data_item_name: "left_indicator_open_fault",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "right_indicator_open_fault-v1",
    data_item_name: "right_indicator_open_fault",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "left_indicator_fault-v1",
    data_item_name: "left_indicator_fault",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "right_indicator_fault-v1",
    data_item_name: "right_indicator_fault",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "motor_fan_fault-v1",
    data_item_name: "motor_fan_fault",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "tail_lamp_fault-v1",
    data_item_name: "tail_lamp_fault",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "kill_switch-v1",
    data_item_name: "kill_switch",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "gsm_1_8v-v1",
    data_item_name: "gsm_1_8v",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "charger_status-v1",
    data_item_name: "charger_status",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 0
  },
  {
    channel: "mcu",
    data_item_id: "vcu_status-v1",
    data_item_name: "vcu_status",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "bms_status-v1",
    data_item_name: "bms_status",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "bms_key_in_status-v1",
    data_item_name: "bms_key_in_status",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "vehicle_previous_state-v1",
    data_item_name: "vehicle_previous_state",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 3
  },
  {
    channel: "mcu",
    data_item_id: "vehicle_current_state-v1",
    data_item_name: "vehicle_current_state",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 3
  },
  {
    channel: "mcu",
    data_item_id: "motor_previous_state-v1",
    data_item_name: "motor_previous_state",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 2
  },
  {
    channel: "mcu",
    data_item_id: "motor_current_state-v1",
    data_item_name: "motor_current_state",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  },
  {
    channel: "mcu",
    data_item_id: "motor_power_status-v1",
    data_item_name: "motor_power_status",
    device_uuid: "s_248",
    sequence: 1041,
    timestamp: "2020-03-09T10:22:06.076Z",
    value: 1
  }
]

export const PRE_BIG_SINK_MCU = {
  data: [
    {
      seq_num: 1041,
      timestamp: 1583749326.076,
      data: "01000000000000010000000101000101010100010001010000000101000000000000000001000001010103030201010002000000"
    }
  ],
  attributes: {
    channel: "mcu",
    bike_id: "s_248",
    version: "v1"
  }
}
