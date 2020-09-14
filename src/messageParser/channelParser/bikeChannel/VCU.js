import {parseMessageWithKeysAsDINames} from "../utils/parseMessageWithKeysAsDINames"
import {getVCUDecoder} from "./channelDecoder/getVCUDecoder"

export const parseVCU = () => {
  const decodeVCUMessage = getVCUDecoder()

  return message => {
    const {attributes} = message
    const decodedMessage = decodeVCUMessage(message)

    return parseMessageWithKeysAsDINames(decodedMessage, attributes)
  }
}
