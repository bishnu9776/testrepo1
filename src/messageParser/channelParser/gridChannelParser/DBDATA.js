import {parseMessage} from "../utils/parseMessage"

export const parseDBDATA = () => {
  return message => {
    const {attributes} = message
    return parseMessage(message.data, attributes)
  }
}
