import {flatten} from "ramda"
import {getDataItem} from "./helpers"
import {decodeCANMessage} from "./channelDecoder/decodeCANMessage"

export const parseCAN = () => {
  const {env} = process
  let decodedMessage = []
  const shouldDecodeMessage = JSON.parse(env.VI_SHOULD_DECODE_CAN_MESSAGE || "false")
  const getDecodeCanMessage = shouldDecodeMessage ? decodeCANMessage() : null

  return message => {
    const {data, attributes} = message
    if (shouldDecodeMessage) {
      decodedMessage = flatten(getDecodeCanMessage(message))
    } else {
      decodedMessage = flatten(data.map(e => e.parsed))
    }

    return decodedMessage.map(e => {
      const timestamp = new Date(e.timestamp * 1000).toISOString()
      return getDataItem({
        dataItemName: e.key,
        attributes,
        timestamp,
        value: e.value,
        sequence: e.seq_num,
        bigSinkTimestamp: `${e.bigsink_timestamp}Z`
      })
    })
  }
}
