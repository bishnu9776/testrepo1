export const CAN = {
  attributes: {
    channel: "can",
    bike_id: "s_2404",
    version: "v1"
  },
  data: [
    {
      parsed: [
        {
          can_id: "0x100",
          timestamp: 0,
          seq_num: 1,
          key: "MCU_SOC",
          value: 0,
          bike_id: "s_2404"
        },
        {
          can_id: "0x100",
          timestamp: 0,
          seq_num: 1,
          key: "MCU_CHARGER_TYPE",
          value: 0,
          bike_id: "s_2404"
        }
      ],
      canRaw: {
        can_id: "0x100",
        data: "0101000001040002",
        timestamp: 0,
        seq_num: 1,
        bike_id: "s_2404"
      }
    },
    {
      parsed: [
        {
          can_id: "0x100",
          timestamp: 1,
          seq_num: 3,
          key: "MCU_SOC",
          value: 0,
          bike_id: "s_2404"
        },
        {
          can_id: "0x100",
          timestamp: 1,
          seq_num: 3,
          key: "MCU_CHARGER_TYPE",
          value: 0,
          bike_id: "s_2404"
        }
      ],
      canRaw: {
        can_id: "0x100",
        data: "0101000001040002",
        timestamp: 1,
        seq_num: 3,
        bike_id: "s_2404"
      }
    }
  ]
}

export const CAN_MCU = {
  attributes: {
    channel: "can_mcu/v1_0_0",
    bike_id: "s_2404",
    version: "v1"
  },
  data: [
    {
      parsed: [
        {
          can_id: "256",
          timestamp: 1,
          seq_num: 1,
          key: "MCU_SOC",
          value: 0,
          bike_id: "s_2404"
        },
        {
          can_id: "256",
          timestamp: 1,
          seq_num: 1,
          key: "MCU_CHARGER_TYPE",
          value: 0,
          bike_id: "s_2404"
        }
      ],
      canRaw: {
        can_id: "256",
        data: "72339069031677954",
        timestamp: 1,
        seq_num: 1,
        bike_id: "s_2404"
      }
    },
    {
      parsed: [
        {
          can_id: "256",
          timestamp: 2,
          seq_num: 3,
          key: "MCU_SOC",
          value: 0,
          bike_id: "s_2404"
        },
        {
          can_id: "256",
          timestamp: 2,
          seq_num: 3,
          key: "MCU_CHARGER_TYPE",
          value: 0,
          bike_id: "s_2404"
        }
      ],
      canRaw: {
        can_id: "256",
        data: "72339069031677954",
        timestamp: 2,
        seq_num: 3,
        bike_id: "s_2404"
      }
    }
  ]
}

export const CAN_BMS = {
  attributes: {
    channel: "can_bms/e55",
    bike_id: "BEAGLE-ESS-4",
    version: "v1"
  },
  data: [
    {
      parsed: [
        {
          can_id: "344",
          timestamp: 1,
          seq_num: 1,
          global_seq: 1,
          bike_id: "BEAGLE-ESS-4",
          key: "BMS_2_Aux_Temp1",
          value: 29.57
        },
        {
          can_id: "344",
          timestamp: 1,
          seq_num: 1,
          global_seq: 1,
          bike_id: "BEAGLE-ESS-4",
          key: "BMS_2_Aux_Temp2",
          value: 29.67
        },
        {
          can_id: "344",
          timestamp: 1,
          seq_num: 1,
          global_seq: 1,
          bike_id: "BEAGLE-ESS-4",
          key: "BMS_2_Aux_Temp3",
          value: 29.06
        },
        {
          can_id: "344",
          timestamp: 1,
          seq_num: 1,
          global_seq: 1,
          bike_id: "BEAGLE-ESS-4",
          key: "BMS_2_Aux_Temp4",
          value: 29.21
        }
      ],
      canRaw: {
        can_id: "344",
        data: "10163383059102787851",
        timestamp: 1,
        seq_num: 1,
        global_seq: 1,
        bike_id: "BEAGLE-ESS-4"
      }
    }
  ]
}

export const LEGACY_CAN_MCU = {
  attributes: {
    channel: "can",
    bike_id: "s_2404",
    version: "v1"
  },
  data: [
    {
      parsed: [
        {
          can_id: "256",
          timestamp: 1,
          seq_num: 1,
          key: "MCU_SOC",
          value: 0,
          bike_id: "s_2404"
        },
        {
          can_id: "256",
          timestamp: 1,
          seq_num: 1,
          key: "MCU_CHARGER_TYPE",
          value: 0,
          bike_id: "s_2404"
        }
      ],
      canRaw: {
        can_id: "256",
        data: "72339069031677954",
        timestamp: 1,
        seq_num: 1,
        bike_id: "s_2404"
      }
    },
    {
      parsed: [
        {
          can_id: "256",
          timestamp: 2,
          seq_num: 3,
          key: "MCU_SOC",
          value: 0,
          bike_id: "s_2404"
        },
        {
          can_id: "256",
          timestamp: 2,
          seq_num: 3,
          key: "MCU_CHARGER_TYPE",
          value: 0,
          bike_id: "s_2404"
        }
      ],
      canRaw: {
        can_id: "256",
        data: "72339069031677954",
        timestamp: 2,
        seq_num: 3,
        bike_id: "s_2404"
      }
    }
  ]
}

export const LEGACY_CAN_BMS = {
  attributes: {
    channel: "can",
    bike_id: "BEAGLE-ESS-4",
    version: "v1"
  },
  data: CAN_BMS.data
}
