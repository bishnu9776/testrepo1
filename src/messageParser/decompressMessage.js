import zlib from "zlib"
import fs from "fs"
import avro from "avsc"
import {errorFormatter} from "../utils/errorFormatter"

const {env} = process

const avroDeserialize = message => {
  return new Promise((resolve, reject) => {
    let md
    try {
      const decoder = new avro.streams.BlockDecoder({})

      decoder.on("metadata", metadata => {
        // console.log("Got metadata for message id: ", message.id)
        // console.log("Metadata: ", JSON.stringify(metadata))
        md = metadata
      })

      decoder.on("data", data => {
        // console.log("Got data for message id: ", message.id)
        // console.log("Got data", JSON.stringify(data))
        // console.log("Usind md", JSON.stringify(md))
      })

      decoder.on("error", error => {
        reject(error)
      })

      decoder.on("end", () => {
        // console.log("Message stream ended")
        // resolve()
      })

      decoder.on("finish", () => {
        // console.log("Message stream finished", message.id)
        resolve()
      })

      decoder.on("close", () => {
        console.log("Message stream closed", message.id)
        resolve()
      })

      // console.log("Calling end with message")
      decoder.end(message.data)
    } catch (e) {
      console.log("Error: ", e)
    }
  })
}

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

const deflate = message => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line
    zlib.deflate(message, (error, data) => {
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
    return async message => message.data
  }

  const isPreBigSinkInput = JSON.parse(env.VI_PRE_BIG_SINK_INPUT || "false")
  if (!isPreBigSinkInput) {
    return async message => {
      return unzip(message.data)
    }
  }

  return async message => {
    const legacyBike = !message.attributes.subFolder.includes("v1")
    if (legacyBike) {
      const decompressedMessage = deflate(message.data)
      log.error({ctx: {decompressedMessage}}, "Attribute subfolder does not contain v1.")
      return null
    }
    return avroDeserialize(message)
  }
}
