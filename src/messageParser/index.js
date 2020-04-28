import {flatten, pipe} from "ramda"
import {getDecompresserFn} from "./decompressMessage"
import {getCreateDataItemFromMessageFn} from "./channelParser"
import {ACK_MSG_TAG} from "../constants"
import {errorFormatter} from "../utils/errorFormatter"
import {mergeProbeInfo} from "./mergeProbeInfo"
import {dedupDataItems} from "./dedupDataItems"

const {env} = process

const getDedupFn = metricRegistry => {
  const shouldDedupData = JSON.parse(env.VI_SHOULD_DEDUP_DATA || "true")
  const dedupFn = dedupDataItems(metricRegistry)
  return dataItems => {
    return shouldDedupData ? dedupFn(dataItems) : dataItems
  }
}

const handleJSONParseFailures = (message, error, metricRegistry, log) => {
  metricRegistry.updateStat("Counter", "parse_failures", 1, {})
  let dataToLog

  try {
    dataToLog = message.toString()
  } catch (_) {
    dataToLog = JSON.stringify(message, null, 2)
  }

  log.error({ctx: {data: dataToLog}, error: errorFormatter(error)}, "Could not parse string to JSON")
}

export const getMessageParser = ({log, metricRegistry, probe}) => {
  const maybeDedupDataItems = getDedupFn(metricRegistry)
  const maybeDecompressMessage = getDecompresserFn({log, metricRegistry})
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn()

  return async message => {
    const decompressedMessage = await maybeDecompressMessage(message)
    if (!decompressedMessage) {
      return []
    }

    try {
      const messageJSON = JSON.parse(decompressedMessage.toString())
      const dataItems = pipe(
        createDataItemsFromMessage,
        flatten,
        maybeDedupDataItems
      )({data: messageJSON, attributes: message.attributes})

      return dataItems.map(mergeProbeInfo(probe)).concat({message, tag: ACK_MSG_TAG})
    } catch (error) {
      handleJSONParseFailures(decompressedMessage, error, metricRegistry, log)
    }

    return []
  }
}
