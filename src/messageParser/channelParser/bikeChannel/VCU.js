import {parseMessage} from "../utils/parseMessage"
import {getVCUDecoder} from "./channelDecoder/getVCUDecoder"

export const parseVCU = () => {
  const decodeVCUMessage = getVCUDecoder()

  return message => {
    const {attributes} = message
    const decodedMessage = decodeVCUMessage(message)

    return parseMessage(decodedMessage, attributes)
  }
}
