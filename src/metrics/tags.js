import {path} from "ramda"

const debugStats = JSON.parse(process.env.VI_STATS_PER_DEVICE || "false")

export const getGCPMessageTags = message => {
  // TODO: Hack! Update counter after standardising attributes. Should we move standardizing attributes to within gcp module
  const channel = path(["attributes", "subFolder"], message) || path(["attributes", "channel"], message)
  const device_uuid = path(["attributes", "bike_id"], message) || path(["attributes", "db_id"], message) // eslint-disable-line
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
