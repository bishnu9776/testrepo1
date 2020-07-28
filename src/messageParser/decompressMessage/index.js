import zlib from "zlib"
import {deserializeAvroMessage} from "./deserializeAvroMessage"
import {formatDecompressedMessageJSON} from "./formatDecompressedMessageJSON"
import {errorFormatter} from "../../utils/errorFormatter"

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

const decompressLegacyData = async ({message, log}) => {
  const {data, attributes} = message
  // TODO: Remove this try catch after validating legacy data on staging/production
  // This is only to get the below log message as we haven't yet seen deflate compressed data
  try {
    const decompressedMessage = await inflate(data)
    const messageJSON = JSON.parse(decompressedMessage.toString())
    return formatDecompressedMessageJSON({decompressedMessage: messageJSON, attributes})
  } catch (e) {
    log.error(
      {ctx: {message: JSON.stringify(data), attributes: JSON.stringify(attributes, null, 2)}},
      "Error decompressing legacy data."
    )
    return null
  }
}

const deserializeAvro = async ({message, log}) => {
  const {data, attributes} = message
  try {
    return await deserializeAvroMessage(message)
  } catch (e) {
    log.info(
      {ctx: {message: JSON.stringify(data), attributes: JSON.stringify(attributes, null, 2)}, error: errorFormatter(e)},
      "Error deserializing avro message."
    )
    return null
  }
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
    const {attributes} = message
    const isLegacyMessage = !attributes.subFolder.includes("v1")
    if (isLegacyMessage) {
      return decompressLegacyData({message, log})
    }
    return deserializeAvro({message, log})
  }
}
