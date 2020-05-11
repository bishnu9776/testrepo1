export const vcuConfig = [
  {
    name: "network_status",
    description: "dashboard network status",
    decode: "bytes[0]"
  },
  {
    name: "network_signal",
    description: "dashboard network signal srength in percentage",
    decode: "bytes[1]"
  },
  {
    name: "screen_brightness",
    description: "dashboard screen brightness [0-7]",
    decode: "bytes[2]"
  },
  {
    name: "display_status",
    description: "dashboard display staus [off, on] = [0, 1]",
    decode: "bytes[3]"
  },
  {
    name: "screen_brightness_control",
    description: "brightness auto or manual setting. [auto, manual] = [0, 1]",
    decode: "bytes[4]"
  },
  {
    name: "touchscreen_status",
    description: "dashboard touch enable/disable status. [disable, enable] = [0, 1]",
    decode: "bytes[5]"
  },
  {
    name: "bluetooth_device_status",
    description: "dashboard bluetooth status. [0, 1] = [off, on]",
    decode: "bytes[6]"
  },
  {
    name: "vehicle_range",
    description: "vehicle range in kilometers",
    decode: "bytes[7]"
  },
  {
    name: "incognito_mode",
    description: "dashboad incognito mode. [0, 1] = [off, on]",
    decode: "bytes[8]"
  },
  {
    name: "cpu_thermal_zone0",
    description: "dashboard vcu cpu internal temperature in celius",
    decode: "bytes[9]"
  },
  {
    name: "ddr_temperature",
    description: "temperature near ddr memory",
    decode: "bytes[10]"
  },
  {
    name: "gsm_temperature",
    description: "temperature near gsm chip",
    decode: "bytes[11]"
  },
  {
    name: "buck_temperature",
    description: "temperature near buck in celcius",
    decode: "bytes[12]"
  },
  {
    name: "als_lux",
    description: "als lux value",
    decode: "bytes[13] + (bytes[14] << 8) + (bytes[15] << 16) + (bytes[16] << 24)"
  },
  {
    name: "odometer",
    description: "scooter odometer value in meters",
    decode: "bytes[21] + (bytes[22] << 8) + (bytes[23] << 16) + (bytes[24] << 24)"
  },
  {
    name: "imu_fault",
    description: "dashboard imu fault. [0, 1] = [no fault, fault]",
    decode: "bytes[25]"
  },
  {
    name: "als_fault",
    description: "dashboard als fault. [0, 1] = [no fault, fault]",
    decode: "bytes[26]"
  },
  {
    name: "touch_fault",
    description: "dashboard touchscreen fault. [0, 1] = [no fault, fault]",
    decode: "bytes[27]"
  },
  {
    name: "lcd_power_fault",
    description: "dashboard lcd power fault. [0, 1] = [no fault, fault]",
    decode: "bytes[28]"
  },
  {
    name: "lcd_backlight_fault",
    description: "dashboard backlight fault. [0, 1] = [no fault, fault]",
    decode: "bytes[29]"
  },
  {
    name: "gps_power_fault",
    description: "dashboard gps power fault.[0, 1] = [no fault, fault]",
    decode: "bytes[30]"
  },
  {
    name: "ldu_fault",
    description: "dashboard ldu fault. [0, 1] = [no fault, fault]",
    decode: "bytes[31]"
  }
]
