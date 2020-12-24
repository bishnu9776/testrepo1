import zlib from "zlib"
import {deserializeAvroMessage} from "./deserializeAvroMessage"
import {errorFormatter} from "../../utils/errorFormatter"

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

const decompressUsingInflate = async ({message, log}) => {
  const {data, attributes} = message
  try {
    const decompressedMessage = await inflate(data)
    return JSON.parse(decompressedMessage.toString())
  } catch (e) {
    log.warn(
      {ctx: {message: JSON.stringify(data), attributes: JSON.stringify(attributes, null, 2)}},
      "Error decompressing using inflate."
    )
    return null
  }
}

const deserializeAvro = async ({message, log}) => {
  const {attributes} = message
  try {
    return await deserializeAvroMessage(message)
  } catch (e) {
    log.trace(
      {ctx: {attributes: JSON.stringify(attributes, null, 2)}, error: errorFormatter(e)},
      "Error deserializing avro message."
    )
    return null
  }
}

export const getDecompresserFn = ({log}) => {
  const decompressionConfig = {
    bike: async message => {
      const {attributes} = message
      const isLegacyMessage = attributes.version === "legacy"
      if (isLegacyMessage) {
        return decompressUsingInflate({message, log})
      }
      return deserializeAvro({message, log})
    },
    ci: async message => {
      const isPreBigSink = JSON.parse(process.env.VI_CI_PRE_BIG_SINK_MODE || "false")
      const {attributes} = message

      if (isPreBigSink) {
        const isAvro = attributes.version === "v1"
        return isAvro ? deserializeAvro({message, log}) : JSON.parse(message.data.toString())
      }

      return decompressUsingInflate({message, log})
    }
  }

  return decompressionConfig[process.env.VI_INPUT_TYPE || "bike"]
}
