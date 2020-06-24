import {parseMessage} from "../utils/parseMessage"

export const parsePODINFO = () => {
  return message => {
    const {attributes} = message
    return parseMessage(message.data, attributes)
  }
}
