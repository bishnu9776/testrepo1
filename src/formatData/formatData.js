import {flatten} from "ramda"
import {decompressMessage} from "./decompressMessage"
import {parseChannelMessage} from "./channelParser"
import {ACK_MSG_TAG} from "../constants"
import {dedupData} from "./channelParser/helpers"
import {errorFormatter} from "../utils/errorFormatter"
import {mergeProbeInfo} from "./mergeProbeInfo"

const {env} = process
export const formatData = ({log, metricRegistry, probe}) => async msg => {
  const dedupFn = dedupData(metricRegistry)
  const shouldDecompressMessage = env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG
    ? JSON.parse(env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG)
    : true

  let decompressedMessage
  let parsedMessage

  try {
    if (shouldDecompressMessage) {
      decompressedMessage = await decompressMessage(msg.data)
    } else {
      decompressedMessage = msg.data
    }
  } catch (e) {
    metricRegistry.updateStat("Counter", "decompress_failures", 1, {})
    return null
  }

  try {
    parsedMessage = JSON.parse(decompressedMessage.toString())
    const dataItems = parseChannelMessage({data: parsedMessage, attributes: msg.attributes, probe})
    return dataItems
      ? flatten(dedupFn(dataItems))
          .map(mergeProbeInfo(probe))
          .concat({message: msg, tag: ACK_MSG_TAG})
      : null
  } catch (e) {
    metricRegistry.updateStat("Counter", "parse_failures", 1, {})
    let dataToLog

    try {
      dataToLog = decompressedMessage.toString()
    } catch (_) {
      dataToLog = JSON.stringify(decompressedMessage, null, 2)
    }

    log.error({ctx: {data: dataToLog}, error: errorFormatter(e)}, "Could not parse string to JSON") // change to debug once we know how to handle all data
    return null
  }
}
