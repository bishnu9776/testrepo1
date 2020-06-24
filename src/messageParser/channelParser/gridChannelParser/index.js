import {isNil} from "ramda"
import {log} from "../../../logger"
import {parseCAN} from "./CAN"
import {parseRMS} from "./RMS"
import {parseMessage} from "../utils/parseMessage"

const parseGeneric = () => {
  return message => {
    const {attributes} = message
    const {env} = process
    return parseMessage(message.data, attributes, env.VI_DEPLOY_PROFILE)
  }
}

export const getGridMessageParserFn = () => {
  const channelParserConfig = {
    can: parseCAN(),
    rms_data: parseRMS(),
    db_data: parseGeneric(),
    db_info: parseGeneric(),
    network_data: parseGeneric(),
    pod_info: parseGeneric(),
    session_data: parseGeneric()
  }

  const channelNotInParserConfig = channel => isNil(channelParserConfig[channel])

  return message => {
    const {channel} = message.attributes
    if (channel.match(/^can/)) {
      return channelParserConfig.can(message)
    }
    if (channelNotInParserConfig(channel)) {
      log.warn({ctx: {message: JSON.stringify(message, null, 2)}}, "No parser for message. Dropping event")
      return []
    }
    return channelParserConfig[channel](message)
  }
}
