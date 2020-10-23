import {flatten} from "ramda"
import {getRMSDecoder} from "./channelDecoder/getRMSDecoder"
import {parseMessageWithKeysAsDINames} from "../utils/parseMessageWithKeysAsDINames"

export const parseRMSDATA = () => {
  const decodeRMS = getRMSDecoder()

  return ({data, attributes}) => {
    const decodedRmsData = decodeRMS({data: flatten([data]), attributes})
    return parseMessageWithKeysAsDINames(decodedRmsData, attributes)
  }
}
