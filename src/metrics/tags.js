import {path} from "ramda"

const debugStats = JSON.parse(process.env.VI_STATS_PER_DEVICE || "false")

const getChannel = message => {
  return path(["attributes", "subFolder"], message) || path(["attributes", "channel"], message)
}

const getDeviceUuid = message => {
  return path(["attributes", "bike_id"], message) || path(["attributes", "db_id"], message)
}

export const getGCPMessageTags = message => {
  const channel = getChannel(message)
  const device_uuid = getDeviceUuid(message) // eslint-disable-line
  return debugStats
    ? {
        channel,
        device_uuid
      }
    : {channel}
}

export const getEventTags = event => {
  const {device_uuid, channel} = event // eslint-disable-line
  return debugStats
    ? {
        device_uuid,
        channel
      }
    : {channel}
}
