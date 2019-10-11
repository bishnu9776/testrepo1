import R from "ramda"
import {decompressMessage} from "./decompressMessage"
import {ACK_MSG_TAG} from "../constants"

const {env} = process

export const formatData = ({log, metricRegistry}) => async msg => {
  const shouldDecompressMessage = env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG
    ? JSON.parse(env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG)
    : false

  if (shouldDecompressMessage) {
    let decompressedMessage
    let parsedMessage

    try {
      decompressedMessage = await decompressMessage(msg.data)
    } catch (e) {
      metricRegistry.updateStat("Counter", "decompress_failures", 1, {})
      return null
    }

    try {
      parsedMessage = JSON.parse(decompressedMessage.toString())
      // const {attributes} = msg.meta
      // construct events using attributes

      return [
        R.flatten([parsedMessage]).map(x => ({...x, tag: "MTConnectDataItems"})),
        {message: msg, tag: ACK_MSG_TAG}
      ]
    } catch (e) {
      metricRegistry.updateStat("Counter", "parse_failures", 1, {})
      log.debug({ctx: {data: decompressedMessage.toString()}}, "Could not parse string to JSON")
      return null
    }
  }
}
