import {flatten, isNil, pipe} from "ramda"
import {getDecompresserFn} from "./decompressMessage"
import {ACK_MSG_TAG} from "../constants"
import {errorFormatter} from "../utils/errorFormatter"
import {getMergeProbeInfoFn} from "./mergeProbeInfo"
import {dedupDataItems} from "./dedupDataItems"
import {getChannelParser} from "./channelParser"

const {env} = process

const getDedupFn = metricRegistry => {
  const shouldDedupData = JSON.parse(env.VI_SHOULD_DEDUP_DATA || "true")
  const dedupFn = dedupDataItems(metricRegistry)
  return dataItems => {
    return shouldDedupData ? dedupFn(dataItems) : dataItems
  }
}

const handleParseFailures = (message, error, appContext) => {
  const {metricRegistry, log} = appContext
  const {data, attributes} = message
  metricRegistry.updateStat("Counter", "parse_failures", 1, {})
  log.warn(
    {ctx: {data: JSON.stringify(data), attributes: JSON.stringify(attributes, null, 2)}, error: errorFormatter(error)},
    "Could not parse gcp message"
  )
}

// decompresses / decodes, converts message into array of connect events, dedups, merges probe info
export const getMessageParser = ({appContext, probe}) => {
  const {metricRegistry} = appContext
  const maybeDedupDataItems = getDedupFn(metricRegistry)
  const decompressMessage = getDecompresserFn(appContext)
  const createDataItemsFromMessage = getChannelParser()(appContext, probe)
  const mergeProbeInfo = getMergeProbeInfoFn(probe)

  return async event => {
    const {message, acknowledgeMessage} = event
    let decompressedMessage
    const endOfEvent = [{message, tag: ACK_MSG_TAG, acknowledgeMessage}]

    try {
      const {attributes} = message
      decompressedMessage = await decompressMessage(message)

      if (isNil(decompressedMessage)) {
        metricRegistry.updateStat("Counter", "decompress_failures", 1, {})
        return endOfEvent
      }

      const dataItems = pipe(
        createDataItemsFromMessage,
        flatten,
        maybeDedupDataItems
      )({message: {data: decompressedMessage, attributes}})

      return dataItems.map(mergeProbeInfo).concat(endOfEvent)
    } catch (error) {
      handleParseFailures(message, error, appContext)
      return endOfEvent
    }
  }
}
