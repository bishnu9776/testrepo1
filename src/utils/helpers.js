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

// TODO: is agent, instance_id, id etc are required by down stream applictaion
export const getEventFormatter = () => {
  const schemaVersion = process.env.VI_SCHEMA_VERSION
  /* eslint-disable camelcase */
  return event => {
    const {device_uuid, data_item_name, timestamp} = event
    const id = `${device_uuid}-${data_item_name}-${timestamp}`

    return {
      tag: "MTConnectDataItems",
      ...event,
      received_at: new Date().toISOString(),
      agent: "ather",
      id,
      instance_id: id,
      plant: "ather",
      tenant: "ather",
      schema_version: schemaVersion
    }
  }
  /* eslint-disable camelcase */
}
