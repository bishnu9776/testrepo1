import {path} from "ramda"

const debugStats = JSON.parse(process.env.VI_STATS_PER_DEVICE || "false")

export const getGCPMessageTags = message => {
  const channel = path(["attributes", "subFolder"], message)
  const device_uuid = path(["attributes", "bike_id"], message) // eslint-disable-line
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
