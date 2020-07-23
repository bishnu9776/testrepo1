import {flatten, pipe, isNil} from "ramda"
import {getDecompresserFn} from "./decompressMessage"
import {getCreateDataItemFromMessageFn} from "./channelParser"
import {ACK_MSG_TAG} from "../constants"
import {errorFormatter} from "../utils/errorFormatter"
import {getMergeProbeInfoFn} from "./mergeProbeInfo"
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
  const {data, attributes} = message
  metricRegistry.updateStat("Counter", "parse_failures", 1, {})
  log.error(
    {ctx: {data: JSON.stringify(data), attributes: JSON.stringify(attributes, null, 2)}, error: errorFormatter(error)},
    "Could not parse gcp message"
  )
}

const getFormattedAttributes = attributes => {
  const {subFolder, deviceId} = attributes
  const isNonLegacyMessage = subFolder.includes("v1/")
  if (isNonLegacyMessage) {
    return {
      channel: subFolder.split("/").slice(1).join("/"),
      version: subFolder.split("/")[0],
      bike_id: deviceId
    }
  }

  return {
    channel: subFolder,
    bike_id: deviceId,
    version: "legacy"
  }
}

export const getMessageParser = ({log, metricRegistry, probe}) => {
  const maybeDedupDataItems = getDedupFn(metricRegistry)
  const maybeDecompressMessage = getDecompresserFn({log, metricRegistry})
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn(metricRegistry)
  const mergeProbeInfo = getMergeProbeInfoFn(probe)
  const isPreBigSinkInput = JSON.parse(env.VI_PRE_BIG_SINK_INPUT || "false")
  const channelsToDrop = env.VI_CHANNELS_TO_DROP ? env.VI_CHANNELS_TO_DROP.split(",") : []
  const shouldFilterDevice = JSON.parse(env.VI_SHOULD_FILTER_DEVICE || "false")
  const deviceFilterRegex = new RegExp(env.VI_DEVICE_FILTER_REGEX || ".*")

  const shouldDropChannel = channel => channelsToDrop.includes(channel)
  const shouldDropDevice = device => (shouldFilterDevice ? !deviceFilterRegex.test(device) : false)

  return async message => {
    let decompressedMessage

    try {
      const attributes = isPreBigSinkInput ? getFormattedAttributes(message.attributes) : message.attributes
      if (shouldDropChannel(attributes.channel) || shouldDropDevice(attributes.bike_id)) {
        return [{message, tag: ACK_MSG_TAG}]
      }

      decompressedMessage = await maybeDecompressMessage(message)

      if (isNil(decompressedMessage)) {
        metricRegistry.updateStat("Counter", "decompress_failures", 1, {})
        return [{message, tag: ACK_MSG_TAG}]
      }

      const dataItems = pipe(
        createDataItemsFromMessage,
        flatten,
        maybeDedupDataItems
      )({data: decompressedMessage, attributes})

      return dataItems.map(mergeProbeInfo).concat({message, tag: ACK_MSG_TAG})
    } catch (error) {
      handleParseFailures(message, error, metricRegistry, log)
      return [{message, tag: ACK_MSG_TAG}]
    }
  }
}
