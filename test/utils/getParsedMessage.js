/* eslint-disable camelcase */
import {mergeDeepLeft} from "ramda"
import {iso} from "./iso"

export const formatParsedMessage = ({sequence, timestamp, channel, device}) => message => {
  return mergeDeepLeft(message, {sequence, timestamp, channel, device_uuid: device})
}

export const getParsedMessageFn = (channel, device, canId) => (
  data_item_id,
  data_item_name,
  value,
  timestamp,
  sequence
) => ({
  data_item_id,
  data_item_name,
  timestamp: iso(timestamp),
  value,
  channel,
  device_uuid: device,
  ...(sequence && {sequence}),
  ...(canId && {can_id: canId})
})
