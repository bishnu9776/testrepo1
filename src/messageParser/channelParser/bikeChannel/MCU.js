import {parseMessage} from "../utils/parseMessage"
import {getMCUDecoder} from "./channelDecoder/getMCUDecoder"

export const parseMCU = () => {
  const decodeMCUMessage = getMCUDecoder()

  return message => {
    const {attributes} = message
    const decodedMessage = decodeMCUMessage(message)

    return parseMessage(decodedMessage, attributes)
  }
}
