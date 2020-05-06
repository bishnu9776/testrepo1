import {flatten} from "ramda"
import {getDataItem} from "./helpers"
import {getCANMessageDecoder} from "./channelDecoder/getCANMessageDecoder"

export const parseCAN = () => {
  const {env} = process
  const shouldDecodeMessage = JSON.parse(env.VI_SHOULD_DECODE_CAN_MESSAGE || "false")
  const decodeCANMessage = shouldDecodeMessage ? getCANMessageDecoder() : null

  return message => {
    let decodedMessage = []
    const {data, attributes} = message
    if (shouldDecodeMessage) {
      decodedMessage = flatten(decodeCANMessage(message))
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
