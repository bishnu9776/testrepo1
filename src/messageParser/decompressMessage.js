import zlib from "zlib"
import {errorFormatter} from "../utils/errorFormatter"

const {env} = process

const decompressMessage = message => {
  return new Promise((resolve, reject) => {
    zlib.unzip(message, (error, data) => {
      if (error) {
        reject(error)
      }
      resolve(data)
    })
  })
}

export const getDecompresserFn = ({log, metricRegistry}) => {
  const isCompressedMessage = env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG
    ? JSON.parse(env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG)
    : true

  return async message => {
    if (!isCompressedMessage) {
      return message.data
    }

    try {
      return await decompressMessage(message.data)
    } catch (e) {
      metricRegistry.updateStat("Counter", "decompress_failures", 1, {})
      log.error({error: errorFormatter(e)}, "Could not decompress message")
      return null
    }
  }
}
