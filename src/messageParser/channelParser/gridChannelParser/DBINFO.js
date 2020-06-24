import {parseMessage} from "../utils/parseMessage"

export const parseDBINFO = () => {
  return message => {
    const {attributes} = message
    return parseMessage(message.data, attributes)
  }
}
