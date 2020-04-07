import {flatten} from "ramda"
import {decompressMessage} from "./decompressMessage"
import {parseChannelMessage} from "./channelParser"
import {ACK_MSG_TAG} from "../constants"
import {errorFormatter} from "../utils/errorFormatter"
import {mergeProbeInfo} from "./mergeProbeInfo"
import {dedupDataItems} from "./dedupDataItems"

const {env} = process

// TODO: Refactor this
// eslint-disable-next-line
export const parseGCPMessage = ({log, metricRegistry, probe}) => {
  const shouldDedupData = JSON.parse(env.VI_SHOULD_DEDUP_DATA || "true")
  const dedupFn = dedupDataItems(metricRegistry)
  const shouldDecompressMessage = env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG
    ? JSON.parse(env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG)
    : true

  return async msg => {
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
      log.error({error: errorFormatter(e)}, "Could not decompress message") // change to debug once we know how to handle all data
      return null
    }

    try {
      parsedMessage = JSON.parse(decompressedMessage.toString())
      const dataItems = parseChannelMessage({data: parsedMessage, attributes: msg.attributes, probe})

      if (shouldDedupData) {
        return dataItems
          ? flatten(dedupFn(dataItems))
              .map(mergeProbeInfo(probe))
              .concat({message: msg, tag: ACK_MSG_TAG})
          : null
      }

      return dataItems
        ? flatten(dataItems)
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
}
