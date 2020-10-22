import {ACK_MSG_TAG} from "../constants"

const requiredKeys = ["data_item_name", "timestamp", "device_uuid"]

export const isValid = log => event => {
  const eventKeys = Object.keys(event)
  const hasRequiredKeys = requiredKeys.reduce((acc, x) => eventKeys.includes(x) && acc, true)
  if (hasRequiredKeys || event.tag === ACK_MSG_TAG) {
    return true
  }
  log.warn({ctx: {rawEvent: JSON.stringify(event, null, 2)}}, "Event does not contain required keys")
  return false
}

// Note: Remove agent, instance_id after ensuring zero downstream dependencies
export const getEventFormatter = () => {
  const schemaVersion = process.env.VI_DATAITEM_ES_SCHEMA_VERSION
  /* eslint-disable camelcase */
  return event => {
    const {device_uuid, data_item_name, timestamp} = event
    const id = `${device_uuid}-${data_item_name}-${timestamp}`

    return {
      tag: "MTConnectDataItems",
      ...event,
      received_at: new Date().toISOString(),
      agent: "ather",
      instance_id: id,
      plant: process.env.VI_PLANT || "ather",
      tenant: process.env.VI_TENANT || "ather",
      schema_version: schemaVersion,
      data_item_id: getDataItemId({dataItemName: data_item_name, deviceId: device_uuid}) // TODO: Remove adding data item id within the parsers and update tests
    }
  }
  /* eslint-disable camelcase */
}

export const getDataItemId = ({dataItemName, deviceId}) => {
  const isGen2Data = JSON.parse(process.env.VI_COLLECTOR_IS_GEN_2_DATA || "false")

  if (isGen2Data) {
    return `${deviceId}-${dataItemName}`
  }

  return `${dataItemName}-${process.env.VI_GEN1_DATAITEM_ID_VERSION}`
}
