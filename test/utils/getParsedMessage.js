import {mergeDeepLeft} from "ramda"
import {iso} from "./iso"

export const formatParsedMessage = ({sequence, timestamp, channel, device}) => message => {
  return mergeDeepLeft(message, {sequence, timestamp, channel, device_uuid: device})
}

// eslint-disable-next-line camelcase
export const getParsedMessageFn = (channel, device) => (data_item_id, data_item_name, value, sequence, timestamp) => ({
  data_item_id,
  data_item_name,
  sequence,
  timestamp: iso(timestamp),
  value,
  channel,
  device_uuid: device
})
