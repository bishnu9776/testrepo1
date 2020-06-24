import {flatten} from "ramda"
import {getGRIDCANDecoder} from "./channelDecoder/getGRIDCANDecoder"
import {getGridDataItem} from "../utils/getDataItem"

export const parseCAN = () => {
  const {env} = process
  const shouldDecodeMessage = JSON.parse(env.VI_SHOULD_DECODE_MESSAGE || "false")
  const decodeCANMessage = shouldDecodeMessage ? getGRIDCANDecoder() : null

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
      return getGridDataItem({
        dataItemName: e.key,
        attributes,
        timestamp,
        value: e.value,
        sequence: e.seq_num
      })
    })
  }
}
