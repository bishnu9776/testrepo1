import zlib from "zlib"
import fs from "fs"
import avro from "avsc"
import {errorFormatter} from "../utils/errorFormatter"

const {env} = process

const avroDeserialize = message => {
  return new Promise((resolve, reject) => {
    const output = []
    let md
    try {
      const decoder = new avro.streams.BlockDecoder({})

      decoder.on("metadata", metadata => {
        console.log("Metadata: ", JSON.stringify(metadata))
        md = metadata
      })

      decoder.on("data", data => {
        output.push(data)
        console.log("Got data", JSON.stringify(data))
      })

      decoder.on("error", error => {
        // fs.writeFileSync(
        //   "/Users/subramanyam/work/svc-ather-collector/avro_mock_with_error",
        //   JSON.stringify({data: message.data, attributes: message.attributes})
        // )
        reject(error)
      })

      decoder.on("end", () => {
        // console.log("Message stream ended")
        // resolve()
      })

      decoder.on("finish", () => {
        console.log("Message stream finished")
        // fs.writeFileSync(
        //   "/Users/subramanyam/work/svc-ather-collector/avro_mock",
        //   JSON.stringify({data: message.data, attributes: message.attributes})
        // )
        resolve(output)
      })

      decoder.on("close", () => {
        console.log("Message stream closed")
        resolve(output)
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
    const legacyBike = !message.attributes.subFolder.includes("v1")
    if (legacyBike) {
      const decompressedMessage = deflate(message.data)
      log.error({ctx: {decompressedMessage}}, "Attribute subfolder does not contain v1.")
      return null
    }
    return avroDeserialize(message)
  }
}
