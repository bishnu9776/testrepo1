import {omit} from "ramda"
import probe from "./fixtures/probe.json"
import {clearEnv} from "./utils"
import {getProbeAppender} from "../src/getProbeAppender"

describe("it should update probe", () => {
  const {env} = process
  const schemaVersion = "3"
  beforeEach(() => {
    env.VI_PROBE_DATAITEM_WHITELIST = "MCU_SOC,MCU_CHARGER_TYPE,message"
    env.VI_SCHEMA_VERSION = schemaVersion
    env.VI_SHOULD_SEND_PROBE = "true"
  })

  afterEach(() => {
    clearEnv()
  })

  const device = "device-1"
  const timestamp = new Date().toISOString()
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
            category: "LOG",
            component: "logs",
            id: "message-v3",
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
  }
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

  it("should send probe for a new device", () => {
    const updateProbe = getProbeAppender({probe})
    const [response, probeData] = updateProbe(event)
    expect(response).to.eql(event)
    const probeWithoutTimestamp = omit(["timestamp", "creation_time", "received_at"], probeData)
    expect(probeWithoutTimestamp).to.eql(expectedProbe)
  })

  it("should not send probe for a new device, when VI_SHOULD_SEND_PROBE is false", () => {
    env.VI_SHOULD_SEND_PROBE = "false"
    const updateProbe = getProbeAppender({probe})
    const [response, probeData] = updateProbe(event)
    expect(response).to.eql(event)
    expect(probeData).to.be.undefined
  })

  it("should not send probe for a device which it is already send before", () => {
    const updateProbe = getProbeAppender({probe})
    const [response1, probeData1] = updateProbe(event)
    const [response2, probeData2] = updateProbe(event)
    expect(response1).to.eql(event)
    expect(response2).to.eql(event)
    const probeWithoutTimestamp = omit(["timestamp", "creation_time", "received_at"], probeData1)
    expect(probeWithoutTimestamp).to.eql(expectedProbe)
    expect(probeData2).to.eql(undefined)
  })

  it("should send probe only for whitelisted dataitems", () => {
    env.VI_PROBE_DATAITEM_WHITELIST = "MCU_SOC"
    const updateProbe = getProbeAppender({probe})
    const [response, probeData] = updateProbe(event)
    expect(response).to.eql(event)
    const dataItem = probeData.probe.data_items.data_item
    expect(dataItem.length).to.eql(1)
    expect(dataItem[0].name).to.eql("MCU_SOC")
  })

  it("probe should not contain keys specified in VI_KEYS_TO_DELETE_FROM_PROBE", () => {
    env.VI_PROBE_DATAITEM_WHITELIST = "MCU_SOC"
    env.VI_KEYS_TO_DELETE_FROM_PROBE = "data_item_name,data_item_type,values_schema"
    const updateProbe = getProbeAppender({probe})
    const [response, probeData] = updateProbe(event)
    expect(response).to.eql(event)
    const dataItem = probeData.probe.data_items.data_item
    expect(dataItem[0].data_item_name).to.be.undefined
    expect(dataItem[0].data_item_type).to.be.undefined
    expect(dataItem[0].values_schema).to.be.undefined
    expect(dataItem[0].name).to.eql("MCU_SOC")
  })

  it("should remove keys: (units,sub_type,subcomponent) if they have invalid values", () => {
    env.VI_PROBE_DATAITEM_WHITELIST = "message"
    const updateProbe = getProbeAppender({probe})
    const [response, probeData] = updateProbe(event)
    expect(response).to.eql(event)
    const dataItem = probeData.probe.data_items.data_item
    expect(dataItem[0].name).to.eql("message")
    expect(dataItem[0].unit).to.be.undefined
    expect(dataItem[0].sub_type).to.be.undefined
    expect(dataItem[0].subcomponent).to.eql("foo")
  })
})
