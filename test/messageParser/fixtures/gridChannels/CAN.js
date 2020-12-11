const attributes = {channel: "can", device_id: "DB_001f7b100e91", version: "v1"}

export const CAN = {
  attributes,
  data: [
    {
      parsed: [
        {
          timestamp: 1586189566.96,
          seq_num: 82121,
          global_seq: 49767849,
          can_id: "0x05e",
          pod_id: "0xfffe8",
          key: "POD_AC_Voltage",
          value: 241.094,
          db_id: "DB_001f7b100e91"
        }
      ],
      canRaw: {
        timestamp: 1586189566.96,
        seq_num: 82121,
        global_seq: 49767849,
        can_id: "0x05e",
        pod_id: "0xfffe8",
        data: "91000000c6ad0300",
        db_id: "DB_001f7b100e91"
      }
    }
  ]
}
