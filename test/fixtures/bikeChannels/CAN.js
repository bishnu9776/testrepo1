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
          timestamp: 1570299991.477,
          seq_num: 347731,
          key: "MCU_SOC",
          value: 0,
          bike_id: "s_2404"
        },
        {
          can_id: "0x100",
          timestamp: 1570299991.477,
          seq_num: 347731,
          key: "MCU_CHARGER_TYPE",
          value: 0,
          bike_id: "s_2404"
        }
      ],
      canRaw: {
        can_id: "0x100",
        data: "0101000001040002",
        timestamp: 1570299991.477,
        seq_num: 347731,
        bike_id: "s_2404"
      }
    },
    {
      parsed: [
        {
          can_id: "0x100",
          timestamp: 1570299991.978,
          seq_num: 347733,
          key: "MCU_SOC",
          value: 0,
          bike_id: "s_2404"
        },
        {
          can_id: "0x100",
          timestamp: 1570299991.978,
          seq_num: 347733,
          key: "MCU_CHARGER_TYPE",
          value: 0,
          bike_id: "s_2404"
        }
      ],
      canRaw: {
        can_id: "0x100",
        data: "0101000001040002",
        timestamp: 1570299991.978,
        seq_num: 347733,
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
          can_id: "0x100",
          timestamp: 1570299991.477,
          seq_num: 347731,
          key: "MCU_SOC",
          value: 0,
          bike_id: "s_2404"
        },
        {
          can_id: "0x100",
          timestamp: 1570299991.477,
          seq_num: 347731,
          key: "MCU_CHARGER_TYPE",
          value: 0,
          bike_id: "s_2404"
        }
      ],
      canRaw: {
        can_id: "0x100",
        data: "0101000001040002",
        timestamp: 1570299991.477,
        seq_num: 347731,
        bike_id: "s_2404"
      }
    },
    {
      parsed: [
        {
          can_id: "0x100",
          timestamp: 1570299991.978,
          seq_num: 347733,
          key: "MCU_SOC",
          value: 0,
          bike_id: "s_2404"
        },
        {
          can_id: "0x100",
          timestamp: 1570299991.978,
          seq_num: 347733,
          key: "MCU_CHARGER_TYPE",
          value: 0,
          bike_id: "s_2404"
        }
      ],
      canRaw: {
        can_id: "0x100",
        data: "0101000001040002",
        timestamp: 1570299991.978,
        seq_num: 347733,
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
          can_id: "0x158",
          timestamp: 1587334363.055,
          seq_num: 543232814,
          global_seq: 741485778,
          bike_id: "BEAGLE-ESS-4",
          key: "BMS_2_Aux_Temp1",
          value: 29.57
        },
        {
          can_id: "0x158",
          timestamp: 1587334363.055,
          seq_num: 543232814,
          global_seq: 741485778,
          bike_id: "BEAGLE-ESS-4",
          key: "BMS_2_Aux_Temp2",
          value: 29.67
        },
        {
          can_id: "0x158",
          timestamp: 1587334363.055,
          seq_num: 543232814,
          global_seq: 741485778,
          bike_id: "BEAGLE-ESS-4",
          key: "BMS_2_Aux_Temp3",
          value: 29.06
        },
        {
          can_id: "0x158",
          timestamp: 1587334363.055,
          seq_num: 543232814,
          global_seq: 741485778,
          bike_id: "BEAGLE-ESS-4",
          key: "BMS_2_Aux_Temp4",
          value: 29.21
        }
      ],
      canRaw: {
        can_id: "0x158",
        data: "8d0b970b5a0b690b",
        timestamp: 1587334363.055,
        seq_num: 543232814,
        global_seq: 741485778,
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
  data: CAN_MCU.data
}

export const LEGACY_CAN_BMS = {
  attributes: {
    channel: "can",
    bike_id: "BEAGLE-ESS-4",
    version: "v1"
  },
  data: CAN_BMS.data
}
