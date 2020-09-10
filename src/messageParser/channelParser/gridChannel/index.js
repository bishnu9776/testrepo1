import {isNil} from "ramda"
import {parsePODINFO} from "./POD_INFO"
import {parseCAN} from "./CAN"
import {parseDBINFO} from "./DB_INFO"
import {parseDBDATA} from "./DB_DATA"

const getCiParser = appContext => {
  const {metricRegistry} = appContext

  const channelParserConfig = {
    can: parseCAN,
    db_data: parseDBDATA,
    db_info: parseDBINFO,
    network_data: () => {
      return []
    },
    pod_info: parsePODINFO,
    rms_data: () => {
      return []
    },
    session_data: () => []
  }

  const channelNotInParserConfig = channel => isNil(channelParserConfig[channel])

  return ({message}) => {
    const {channel} = message.attributes

    if (channelNotInParserConfig(channel)) {
      metricRegistry.updateStat("Counter", "num_events_without_parsers", 1, {channel})
      return []
    }

    return channelParserConfig[channel](message)
  }
}

export const getCreateCIEventFromMessageFn = appContext => {
  const parseCiData = getCiParser(appContext)

  return ({message}) => {
    return parseCiData({message})
  }
}
