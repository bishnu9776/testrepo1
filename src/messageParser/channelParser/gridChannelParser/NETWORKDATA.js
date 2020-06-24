import {parseMessage} from "../utils/parseMessage"

export const parseNETWORKDATA = () => {
  return message => {
    const {attributes} = message
    return parseMessage(message.data, attributes)
  }
}
