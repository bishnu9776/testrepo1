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
  sequence,
  timestamp
) => ({
  data_item_id,
  data_item_name,
  timestamp: iso(timestamp),
  value,
  channel,
  device_uuid: device,
  sequence,
  ...(canId && {can_id: canId})
})

export const getCanDecodedMessageFn = (bike_id, can_id) => ({timestamp, seq_num, key, value}) => ({
  can_id,
  timestamp,
  seq_num,
  key,
  value,
  bike_id
})
