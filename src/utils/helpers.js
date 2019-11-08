import {omit} from "ramda"
import {ACK_MSG_TAG} from "../constants"

const requiredKeys = ["data_item_name", "data_item_id", "timestamp", "device_uuid", "sequence"]
export const isValid = log => event => {
  const eventKeys = Object.keys(event)
  const hasRequiredKeys = requiredKeys.reduce((acc, x) => eventKeys.includes(x) && acc, true)
  if (hasRequiredKeys || event.tag === ACK_MSG_TAG) {
    return true
  }

  log.warn({ctx: {rawEvent: JSON.stringify(event, null, 2)}}, "Event does not contain required keys")
  return false
}

export const formatEvent = event => {
  /* eslint-disable camelcase */
  const {device_uuid, data_item_name, timestamp} = event
  const id = `${device_uuid}-${data_item_name}-${timestamp}`

  return {
    tag: "MTConnectDataItems",
    ...omit(["bigsink_timestamp"], event),
    received_at: new Date().toISOString(),
    agent: "ather",
    id,
    instance_id: id,
    plant: "ather",
    tenant: "ather",
    schema_version: "1"
  }
  /* eslint-disable camelcase */
}
