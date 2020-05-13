import {parseMessage} from "./utils/parseMessage"
import {getMCUDecoder} from "./channelDecoder/getMCUDecoder"

export const parseMCU = () => {
  const {env} = process
  const shouldDecodeMessage = JSON.parse(env.VI_SHOULD_DECODE_MESSAGE || "false")
  const decodeMCUMessage = shouldDecodeMessage ? getMCUDecoder() : null

  return message => {
    const {data, attributes} = message
    let decodedMessage = data

    if (shouldDecodeMessage) {
      decodedMessage = decodeMCUMessage(message)
    }

    return parseMessage(decodedMessage, attributes)
  }
}
