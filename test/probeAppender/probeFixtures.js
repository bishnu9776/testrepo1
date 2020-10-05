export const getGen1Probe = ({device, probeEsSchemaVersion}) => ({
  agent: "ather-agent",
  tag: "MTConnectDevices",
  instance_id: "1",
  agent_version: "1.0.0",
  schema_version: probeEsSchemaVersion,
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
          id: "MCU_SOC-v1",
          name: "MCU_SOC",
          type: "mcu_soc"
        },
        {
          category: "SAMPLE",
          id: "MCU_CHARGER_TYPE-v1",
          name: "MCU_CHARGER_TYPE",
          type: "mcu_charger"
        },
        {
          category: "LOG",
          component: "logs",
          id: "message-v1",
          name: "message",
          type: "LOG",
          subcomponent: "foo"
        }
      ]
    },
    mtconnect_devices_attributes: {}
  },
  collector_version: "1.0.0",
  hasRealtimeData: false
})

export const getGen2Probe = ({device, probeEsSchemaVersion}) => ({
  agent: "ather-agent",
  tag: "MTConnectDevices",
  instance_id: "1",
  agent_version: "1.0.0",
  schema_version: probeEsSchemaVersion,
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
          id: `${device}-MCU_SOC`,
          name: "MCU_SOC",
          type: "mcu_soc"
        },
        {
          category: "SAMPLE",
          id: `${device}-MCU_CHARGER_TYPE`,
          name: "MCU_CHARGER_TYPE",
          type: "mcu_charger"
        },
        {
          category: "LOG",
          component: "logs",
          id: `${device}-message`,
          name: "message",
          type: "LOG",
          subcomponent: "foo"
        }
      ]
    },
    mtconnect_devices_attributes: {}
  },
  collector_version: "1.0.0",
  hasRealtimeData: false
})
