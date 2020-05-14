export const MCU = {
  attributes: {
    version: "v1",
    channel: "mcu",
    bike_id: "s_248"
  },
  data: [
    {
      seq_num: 1,
      timestamp: 1,
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

export const PRE_BIG_SINK_MCU = {
  data: [
    {
      seq_num: 1,
      timestamp: 1,
      data: "01000000000000010000000101000101010100010001010000000101000000000000000001000001010103030201010002000000"
    }
  ],
  attributes: {
    channel: "mcu",
    bike_id: "s_248",
    version: "v1"
  }
}
