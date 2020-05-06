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

const handleParseFailures = (message, error, metricRegistry, log) => {
  metricRegistry.updateStat("Counter", "parse_failures", 1, {})
  let dataToLog

  try {
    dataToLog = message.toString()
  } catch (_) {
    dataToLog = JSON.stringify(message, null, 2)
  }

  log.error({ctx: {data: dataToLog}, error: errorFormatter(error)}, "Could not parse gcp message")
}

const getFormattedAttributes = attributes => {
  const {subFolder, deviceId} = attributes
  return {
    channel: subFolder
      .split("/")
      .slice(1)
      .join("/"),
    version: subFolder.split("/")[0],
    bike_id: deviceId
  }
}

export const getMessageParser = ({log, metricRegistry, probe}) => {
  const maybeDedupDataItems = getDedupFn(metricRegistry)
  const maybeDecompressMessage = getDecompresserFn({log, metricRegistry})
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
  const isPreBigSinkInput = JSON.parse(env.VI_PRE_BIG_SINK_INPUT || "false")

  return async message => {
    let decompressedMessage

    try {
      const attributes = isPreBigSinkInput ? getFormattedAttributes(message.attributes) : message.attributes
      decompressedMessage = await maybeDecompressMessage(message)
      if (!decompressedMessage) {
        return []
      }
      const messageJSON = JSON.parse(decompressedMessage.toString())
      const dataItems = pipe(createDataItemsFromMessage, flatten, maybeDedupDataItems)({data: messageJSON, attributes})

      return dataItems.map(mergeProbeInfo(probe)).concat({message, tag: ACK_MSG_TAG})
    } catch (error) {
      handleParseFailures(decompressedMessage, error, metricRegistry, log)
    }

    return []
  }
}
