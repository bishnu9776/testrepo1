export const CAN_WITH_SUBFOLDER = {
  attributes: {
    subFolder: "v1/can_mcu/v1_0_0",
    deviceId: "s_2404"
  },
  data: [
    {
      can_id: "256",
      data: "72339069031677954",
      timestamp: 1,
      seq_num: 1,
      bike_id: "s_2404"
    },
    {
      can_id: "256",
      data: "72339069031677954",
      timestamp: 2,
      seq_num: 3,
      bike_id: "s_2404"
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
      can_id: "256",
      data: "72339069031677954",
      timestamp: 1,
      seq_num: 1,
      bike_id: "s_2404"
    },
    {
      can_id: "256",
      data: "72339069031677954",
      timestamp: 2,
      seq_num: 3,
      bike_id: "s_2404"
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
      can_id: "344",
      data: "10163383059102787851",
      timestamp: 1,
      seq_num: 1,
      bike_id: "BEAGLE-ESS-4"
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
