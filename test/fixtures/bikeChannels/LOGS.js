export const LOGS = {
  attributes: {
    channel: "logs",
    bike_id: "s_248",
    version: "v1"
  },
  data: [
    {
      message: "log message1",
      timestamp: 0,
      _comm: "vcu-s340-app"
    },
    {
      message: "log message2",
      timestamp: 1,
      _comm: "vcu-s340-app"
    },
    {
      message: "log message3",
      timestamp: 2,
      _comm: "vcu-s340-app"
    }
  ]
}

/**
 * {
    device_uuid: 'BMS-EOL12',
    data_item_name: 'message',
    data_item_id: 'message-v1',
    timestamp: '2020-07-21T08:57:43.241Z',
    channel: 'logs',
    value_event: 'backlight file open failedopen /sys/class/backlight/backlight.16/brightness: no such file or directory',
    data_item_type: 'LOG',
    category: 'EVENT'
  },
 */
