import {omit} from "ramda"
import probe from "../fixtures/probe.json"
import {clearEnv} from "../utils"
import {getProbeUpdater} from "../../src/probeUpdater/getProbeUpdater"
import {getGen1Probe, getGen2Probe} from "./probeFixtures"

describe("it should update probe", () => {
  const {env} = process
  const probeEsSchemaVersion = "probe-v1"
  beforeEach(() => {
    env.VI_PROBE_DATAITEM_WHITELIST = "MCU_SOC,MCU_CHARGER_TYPE,message"
    env.VI_PROBE_ES_SCHEMA_VERSION = probeEsSchemaVersion
    env.VI_SHOULD_SEND_PROBE = "true"
    env.VI_GEN1_DATAITEM_ID_VERSION = "v1"
  })

  afterEach(() => {
    clearEnv()
  })

  const device = "device-1"

  const event = {
    device_uuid: device,
    data_item_name: "MCU_SOC"
  }

  it("should send probe for a new device", () => {
    const updateProbe = getProbeUpdater({probe})
    const [response, probeData] = updateProbe(event)
    expect(response).to.eql(event)
    const probeWithoutTimestamp = omit(["timestamp", "creation_time", "received_at"], probeData)
    expect(probeWithoutTimestamp).to.eql(getGen1Probe({device, probeEsSchemaVersion}))
  })

  it("should not send probe for a new device, when VI_SHOULD_SEND_PROBE is false", () => {
    env.VI_SHOULD_SEND_PROBE = "false"
    const updateProbe = getProbeUpdater({probe})
    const [response, probeData] = updateProbe(event)
    expect(response).to.eql(event)
    expect(probeData).to.be.undefined
  })

  it("should not send probe for a device which it is already send before", () => {
    const updateProbe = getProbeUpdater({probe})
    const [response1, probeData1] = updateProbe(event)
    const [response2, probeData2] = updateProbe(event)
    expect(response1).to.eql(event)
    expect(response2).to.eql(event)
    const probeWithoutTimestamp = omit(["timestamp", "creation_time", "received_at"], probeData1)
    expect(probeWithoutTimestamp).to.eql(getGen1Probe({device, probeEsSchemaVersion}))
    expect(probeData2).to.eql(undefined)
  })

  it("should send probe only for whitelisted dataitems", () => {
    env.VI_PROBE_DATAITEM_WHITELIST = "MCU_SOC"
    const updateProbe = getProbeUpdater({probe})
    const [response, probeData] = updateProbe(event)
    expect(response).to.eql(event)
    const dataItem = probeData.probe.data_items.data_item
    expect(dataItem.length).to.eql(1)
    expect(dataItem[0].name).to.eql("MCU_SOC")
  })

  it("probe should not contain keys specified in VI_KEYS_TO_DELETE_FROM_PROBE", () => {
    env.VI_PROBE_DATAITEM_WHITELIST = "MCU_SOC"
    env.VI_KEYS_TO_DELETE_FROM_PROBE = "data_item_name,data_item_type,values_schema"
    const updateProbe = getProbeUpdater({probe})
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
    const updateProbe = getProbeUpdater({probe})
    const [response, probeData] = updateProbe(event)
    expect(response).to.eql(event)
    const dataItem = probeData.probe.data_items.data_item
    expect(dataItem[0].name).to.eql("message")
    expect(dataItem[0].unit).to.be.undefined
    expect(dataItem[0].sub_type).to.be.undefined
    expect(dataItem[0].subcomponent).to.eql("foo")
  })

  it("should use device_uuid to construct data_item_id for gen-2 data", () => {
    env.VI_COLLECTOR_IS_GEN_2_DATA = "true"
    const updateProbe = getProbeUpdater({probe})
    // eslint-disable-next-line no-unused-vars
    const [_, probeData] = updateProbe(event)
    const probeWithoutTimestamp = omit(["timestamp", "creation_time", "received_at"], probeData)
    expect(probeWithoutTimestamp).to.eql(getGen2Probe({device, probeEsSchemaVersion}))
    clearEnv()
  })
})
