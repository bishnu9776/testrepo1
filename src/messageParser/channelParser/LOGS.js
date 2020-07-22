import {parseMessage} from "./utils/parseMessage"

export const parseLOG = message => {
  if (message) {
    const {data, attributes} = message
    return parseMessage(data, attributes)
  }
  return []
}
