import {flatten} from "ramda"
import {getRMSDecoder} from "./channelDecoder/getRMSDecoder"
import {parseMessage} from "../utils/parseMessage"

export const parseRMS = () => {
  const {env} = process
  const shouldDecodeMessage = JSON.parse(env.VI_SHOULD_DECODE_MESSAGE || "false")
  const decodeRMSMessage = shouldDecodeMessage ? getRMSDecoder() : null

  return message => {
    const {attributes} = message
    const decodedMessage = flatten(decodeRMSMessage(message))
    return parseMessage(decodedMessage, attributes)
  }
}
