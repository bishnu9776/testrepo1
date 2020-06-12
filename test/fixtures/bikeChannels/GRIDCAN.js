export const GRIDCAN = {
  attributes: {
    channel: "can",
    bike_id: "DB_1234",
    version: "v1"
  },
  data: [
    {
      parsed: [
        {
          timestamp: 1591631206.728,
          seq_num: 9176840,
          can_id: "0x05e",
          pod_id: "0xfffe2",
          key: "POD_UserLedColour",
          value: 2,
          db_id: "DB_1234"
        }
      ],
      canRaw: {
        timestamp: 1591631206.728,
        seq_num: 9176840,
        can_id: "0x05e",
        pod_id: "0xfffe2",
        data: "0b00000002000000",
        db_id: "DB_1234"
      }
    }
  ]
}
