import {parseMessage} from "../utils/parseMessage"
import {getVCUDecoder} from "./channelDecoder/getVCUDecoder"

export const parseVCU = () => {
  const {env} = process
  const shouldDecodeMessage = JSON.parse(env.VI_SHOULD_DECODE_MESSAGE || "false")
  const decodeVCUMessage = shouldDecodeMessage ? getVCUDecoder() : null

  return message => {
    const {data, attributes} = message
    let decodedMessage = data

    if (shouldDecodeMessage) {
      decodedMessage = decodeVCUMessage(message)
    }

    return parseMessage(decodedMessage, attributes)
  }
}
