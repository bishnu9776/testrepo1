import zlib from "zlib"
import R from "ramda"

const {env} = process

export const formatData = log => msg => {
  const shouldDecompressMessage = env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG
    ? JSON.parse(env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG)
    : false

  if (shouldDecompressMessage) {
    let decompressedMessage
    let parsedMessage

    try {
      decompressedMessage = zlib.unzipSync(msg.data) // TODO: Make this async and use mergeMap
    } catch (e) {
      log.warn("Could not decompress message")
      return null
    }

    try {
      parsedMessage = JSON.parse(decompressedMessage.toString())
      // const {attributes} = msg.meta
      // construct events using attributes
      // attack msg.ackId to meta of last event in array

      return [
        R.flatten([parsedMessage]).map(x => ({...x, tag: "MTConnectDataItems"})),
        {type: "ack", ackId: msg.meta.ackId}
      ]
    } catch (e) {
      log.warn({ctx: {data: decompressedMessage.toString()}}, "Could not parse string to JSON")
      return null
    }
  }
}
