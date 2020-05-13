import {mergeDeepLeft} from "ramda"

export const formatParsedMessage = ({sequence, timestamp, channel, device}) => message => {
  return mergeDeepLeft(message, {sequence, timestamp, channel, device_uuid: device})
}
