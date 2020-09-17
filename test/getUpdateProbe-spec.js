import {omit} from "ramda"
import probe from "./fixtures/probe.json"
import {clearEnv} from "./utils"
import {getUpdateProbe} from "../src/getUpdateProbe"

describe("it should update probe", () => {
  const {env} = process
  const schemaVersion = "3"
  beforeEach(() => {
    env.VI_DATAITEM_WHITELIST = "MCU_SOC,MCU_CHARGER_TYPE,GPS_TPV"
    env.VI_SCHEMA_VERSION = schemaVersion
    env.VI_SHOULD_SEND_PROBE = "true"
  })

  afterEach(() => {
    clearEnv()
  })

  it("should send probe for a new device", () => {
    const device = "device-1"
    const timestamp = new Date().toISOString()

    const updateProbe = getUpdateProbe({probe})
    const event = {
      tag: "MTConnectDataItems",
      device_uuid: device,
      data_item_name: "MCU_SOC",
      data_item_id: "MCU_SOC-v1",
      timestamp,
      channel: "can_mcu/v1_0_0",
      sequence: 1,
      can_id: "0x100",
      value: 90,
      component: "mcu",
      data_item_type: "mcu_soc",
      received_at: timestamp,
      agent: "ather",
      instance_id: `s_3432-MCU_SOC-${timestamp}`,
      plant: "ather",
      tenant: "ather",
      schema_version: undefined
    }
    const [response, probeData] = updateProbe(event)
    expect(response).to.eql(event)
    const expectedProbe = {
      agent: "ather-agent",
      tag: "MTConnectDevices",
      instance_id: "1",
      agent_version: "1.0.0",
      schema_version: schemaVersion,
      plant: "ather",
      tenant: "ather",
      device_uuid: device,
      probe: {
        id: device,
        name: device,
        uuid: device,
        description: {},
        data_items: {
          data_item: [
            {
              component: "mcu",
              id: "MCU_SOC-v3",
              name: "MCU_SOC",
              type: "mcu_soc"
            },
            {
              category: "SAMPLE",
              id: "MCU_CHARGER_TYPE-v3",
              name: "MCU_CHARGER_TYPE",
              type: "mcu_charger"
            },
            {
              category: "LOCATION",
              id: "GPS_TPV-v3",
              name: "GPS_TPV",
              type: "lat_val"
            }
          ]
        },
        mtconnect_devices_attributes: {}
      },
      collector_version: "1.0.0",
      hasRealtimeData: false
    }
    const probeWithoutTimestamp = omit(["timestamp", "creation_time", "received_at"], probeData)
    expect(probeWithoutTimestamp).to.eql(expectedProbe)
  })
})
