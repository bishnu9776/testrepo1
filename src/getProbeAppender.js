import {contains, intersection} from "ramda"
import {isNilOrEmpty} from "./utils/isNilOrEmpty"

const {env} = process

const getDeviceProbe = (device, probe, schemaVersion) => {
  const timestamp = new Date().toISOString()
  const version = "1.0.0"
  return {
    agent: "ather-agent",
    tag: "MTConnectDevices",
    instance_id: "1",
    agent_version: version,
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
        data_item: probe
      },
      mtconnect_devices_attributes: {}
    },
    timestamp,
    creation_time: timestamp,
    received_at: timestamp,
    collector_version: version,
    hasRealtimeData: false
  }
}

const getType = dataItemType => {
  if (isNilOrEmpty(dataItemType) && contains(dataItemType, ["?", ""])) {
    return "UNKNOWN"
  }
  return dataItemType
}

const formatProbe = (probe, whitelistedDataItems, schemaVersion) => {
  const formattedProbe = []
  const dataItems = Object.keys(probe)
  const keysInWhitelistedDataItems = intersection(dataItems, whitelistedDataItems)
  const keysToCheckForValidValues = ["units", "sub_type", "subcomponent"]
  const keysToDeleteFromProbe = env.VI_KEYS_TO_DELETE_FROM_PROBE
    ? env.VI_KEYS_TO_DELETE_FROM_PROBE.split(",")
    : ["data_item_name", "data_item_type", "values_schema"]

  keysInWhitelistedDataItems.map(dataItem => {
    const value = {...probe[dataItem]}
    value.name = value.data_item_name
    value.type = getType(value.data_item_type)
    value.id = `${value.name}-v${schemaVersion}`
    keysToDeleteFromProbe.map(key => delete value[key])
    keysToCheckForValidValues.map(key => {
      if (value[key] === "" || value[key] === "?") {
        delete value[key]
      }
      return value
    })
    return formattedProbe.push(value)
  })
  return formattedProbe
}

export const getProbeAppender = ({probe}) => {
  const listOfDevices = []
  const whitelistedDataItems = env.VI_PROBE_DATAITEM_WHITELIST ? env.VI_PROBE_DATAITEM_WHITELIST.split(",") : []
  const schemaVersion = env.VI_SCHEMA_VERSION || "3"
  const shouldSendProbe = JSON.parse(env.VI_SHOULD_SEND_PROBE || "false")

  const formattedProbe = formatProbe(probe, whitelistedDataItems, schemaVersion)
  return event => {
    const device = event?.device_uuid
    if (!isNilOrEmpty(device) && !listOfDevices.includes(device) && shouldSendProbe) {
      const probeToSend = getDeviceProbe(device, formattedProbe, schemaVersion)
      listOfDevices.push(device)
      return [event, probeToSend]
    }
    return [event]
  }
}
