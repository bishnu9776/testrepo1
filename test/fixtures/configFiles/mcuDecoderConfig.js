module.exports = [
  {
    name: "left_brake",
    description: "bike left brake",
    decode: "bytes[0]"
  },
  {
    name: "right_brake",
    description: "dashboard network signal srength in percentage",
    decode: "bytes[1]"
  },
  {
    name: "head_lamp_switch",
    description: "dashboard screen brightness [0-7]",
    decode: "bytes[2]"
  },
  {
    name: "horn_switch",
    description: "dashboard display staus [off, on] = [0, 1]",
    decode: "bytes[3]"
  },
  {
    name: "left_indicator_switch",
    description: "brightness auto or manual setting. [auto, manual] = [0, 1]",
    decode: "bytes[4]"
  },
  {
    name: "right_indicator_switch",
    description: "dashboard touch enable/disable status. [disable, enable] = [0, 1]",
    decode: "bytes[5]"
  },
  {
    name: "no_indicator_switch",
    description: "dashboard bluetooth status. [0, 1] = [off, on]",
    decode: "bytes[6]"
  },
  {
    name: "key_switch",
    description: "vehicle range in kilometers",
    decode: "bytes[7]"
  },
  {
    name: "start_switch",
    description: "dashboad incognito mode. [0, 1] = [off, on]",
    decode: "bytes[8]"
  },
  {
    name: "left_scroll_switch",
    description: "dashboard vcu cpu internal temperature in celius",
    decode: "bytes[9]"
  },
  {
    name: "right_scroll_switch",
    description: "temperature near ddr memory",
    decode: "bytes[10]"
  },
  {
    name: "side_stand",
    description: "side stand status. [0, 1] = [deploy, retract]",
    decode: "bytes[11]"
  },
  {
    name: "ldu",
    description: "temperature near buck in celcius",
    decode: "bytes[12]"
  },
  {
    name: "solenoid_feedback",
    description: "bike left brake",
    decode: "bytes[13]"
  },
  {
    name: "gsm_power",
    description: "dashboard network signal srength in percentage",
    decode: "bytes[14]"
  },
  {
    name: "gps_power",
    description: "dashboard screen brightness [0-7]",
    decode: "bytes[15]"
  },
  {
    name: "als_power",
    description: "dashboard display staus [off, on] = [0, 1]",
    decode: "bytes[16]"
  },
  {
    name: "imu_power",
    description: "brightness auto or manual setting. [auto, manual] = [0, 1]",
    decode: "bytes[17]"
  },
  {
    name: "motor_fan",
    description: "dashboard touch enable/disable status. [disable, enable] = [0, 1]",
    decode: "bytes[18]"
  },
  {
    name: "low_beam",
    description: "dashboard bluetooth status. [0, 1] = [off, on]",
    decode: "bytes[19]"
  },
  {
    name: "high_beam",
    description: "vehicle range in kilometers",
    decode: "bytes[20]"
  },
  {
    name: "tail_lamp",
    description: "dashboad incognito mode. [0, 1] = [off, on]",
    decode: "bytes[21]"
  },
  {
    name: "stop_lamp",
    description: "dashboard vcu cpu internal temperature in celius",
    decode: "bytes[22]"
  },
  {
    name: "horn",
    description: "temperature near ddr memory",
    decode: "bytes[23]"
  },
  {
    name: "left_indicator",
    description: "side stand status. [0, 1] = [deploy, retract]",
    decode: "bytes[24]"
  },
  {
    name: "right_indicator",
    description: "temperature near buck in celcius",
    decode: "bytes[25]"
  },
  {
    name: "position_lamp",
    description: "bike left brake",
    decode: "bytes[26]"
  },
  {
    name: "license_plate",
    description: "dashboard network signal srength in percentage",
    decode: "bytes[27]"
  },
  {
    name: "high_beam_fault",
    description: "dashboard screen brightness [0-7]",
    decode: "bytes[28]"
  },
  {
    name: "low_beam_fault",
    description: "dashboard display staus [off, on] = [0, 1]",
    decode: "bytes[29]"
  },
  {
    name: "left_indicator_open_fault",
    description: "brightness auto or manual setting. [auto, manual] = [0, 1]",
    decode: "bytes[30]"
  },
  {
    name: "right_indicator_open_fault",
    description: "dashboard touch enable/disable status. [disable, enable] = [0, 1]",
    decode: "bytes[31]"
  },
  {
    name: "left_indicator_fault",
    description: "dashboard bluetooth status. [0, 1] = [off, on]",
    decode: "bytes[32]"
  },
  {
    name: "right_indicator_fault",
    description: "vehicle range in kilometers",
    decode: "bytes[33]"
  },
  {
    name: "motor_fan_fault",
    description: "dashboad incognito mode. [0, 1] = [off, on]",
    decode: "bytes[34]"
  },
  {
    name: "tail_lamp_fault",
    description: "dashboard vcu cpu internal temperature in celius",
    decode: "bytes[35]"
  },
  {
    name: "kill_switch",
    description: "temperature near ddr memory",
    decode: "bytes[36]"
  },
  {
    name: "gsm_1_8v",
    description: "side stand status. [0, 1] = [deploy, retract]",
    decode: "bytes[37]"
  },
  {
    name: "charger_status",
    description: "temperature near buck in celcius",
    decode: "bytes[38]"
  },
  {
    name: "vcu_status",
    description: "bike left brake",
    decode: "bytes[39]"
  },
  {
    name: "bms_status",
    description: "dashboard network signal srength in percentage",
    decode: "bytes[40]"
  },
  {
    name: "bms_key_in_status",
    description: "dashboard screen brightness [0-7]",
    decode: "bytes[41]"
  },
  {
    name: "vehicle_previous_state",
    description: "dashboard display staus [off, on] = [0, 1]",
    decode: "bytes[42]"
  },
  {
    name: "vehicle_current_state",
    description: "brightness auto or manual setting. [auto, manual] = [0, 1]",
    decode: "bytes[43]"
  },
  {
    name: "motor_previous_state",
    description: "dashboard touch enable/disable status. [disable, enable] = [0, 1]",
    decode: "bytes[44]"
  },
  {
    name: "motor_current_state",
    description: "dashboard bluetooth status. [0, 1] = [off, on]",
    decode: "bytes[45]"
  },
  {
    name: "motor_power_status",
    description: "vehicle range in kilometers",
    decode: "bytes[46]"
  }
]
