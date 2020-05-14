import zlib from "zlib"
import {deserializeAvro} from "./deserializeAvro"
import {formatDecompressedMessageJSON} from "./formatDecompressedMessageJSON"

const {env} = process

const unzip = message => {
  return new Promise((resolve, reject) => {
    zlib.unzip(message, (error, data) => {
      if (error) {
        reject(error)
      }
      resolve(data)
    })
  })
}

const inflate = message => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line
    zlib.inflate(message, (error, data) => {
      if (error) {
        reject(error)
      }
      resolve(data)
    })
  })
}

export const getDecompresserFn = ({log}) => {
  const isCompressedMessage = JSON.parse(env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG || "true")
  if (!isCompressedMessage) {
    return async message => {
      return JSON.parse(message.data.toString())
    }
  }

  const isPreBigSinkInput = JSON.parse(env.VI_PRE_BIG_SINK_INPUT || "false")
  if (!isPreBigSinkInput) {
    return async message => {
      const decompressedMessage = await unzip(message.data)
      return JSON.parse(decompressedMessage.toString())
    }
  }

  return async message => {
    const isLegacyMessage = !message.attributes.subFolder.includes("v1")
    if (isLegacyMessage) {
      let decompressedMessage
      // TODO: Remove this try catch after validating legacy data on staging/production
      // This is only to get the below log message as we haven't yet seen deflate compressed data
      try {
        decompressedMessage = await inflate(message.data)
        const messageJSON = JSON.parse(decompressedMessage.toString())
        return formatDecompressedMessageJSON({decompressedMessage: messageJSON, attributes: message.attributes})
      } catch (e) {
        log.error({ctx: {message: JSON.stringify(message)}}, "Error decompressing legacy data.")
        return null
      }
    }
    return deserializeAvro(message)
  }
}
