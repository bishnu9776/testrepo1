import {parseMessageWithKeysAsDINames} from "../utils/parseMessageWithKeysAsDINames"
import {getMCUDecoder} from "./channelDecoder/getMCUDecoder"

export const parseMCU = () => {
  const decodeMCUMessage = getMCUDecoder()

  return message => {
    const {attributes} = message
    const decodedMessage = decodeMCUMessage(message)

    return parseMessageWithKeysAsDINames(decodedMessage, attributes)
  }
}
