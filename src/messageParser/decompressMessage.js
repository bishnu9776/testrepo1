import zlib from "zlib"
import Long from "long"
import avro from "avsc"

const {env} = process

const longType = avro.types.LongType.__with({
  fromBuffer: buf => {
    return new Long(buf.readInt32LE(), buf.readInt32LE(4)).toString()
  },
  toBuffer: n => {
    const buf = Buffer.alloc(8)
    buf.writeInt32LE(n.getLowBits())
    buf.writeInt32LE(n.getHighBits(), 4)
    return buf
  },
  fromJSON: x => {
    return Long.fromValue(x)
  },
  toJSON: n => {
    return +n
  },
  isValid: x => {
    return Long.isLong(x)
  },
  compare: (n1, n2) => n1.compare(n2)
})

const avroDeserialize = message => {
  return new Promise((resolve, reject) => {
    const output = []

    const decoder = new avro.streams.BlockDecoder({
      parseHook: schema => {
        return avro.Type.forSchema(schema, {registry: {long: longType}})
      }
    })

    // let md
    // decoder.on("metadata", metadata => {
    //   console.log("Metadata: ", JSON.stringify(metadata))
    //   md = metadata
    // })

    decoder.on("data", data => {
      output.push(data)
    })

    decoder.on("error", error => {
      reject(error)
    })

    decoder.on("finish", () => {
      resolve(output)
    })

    decoder.end(message.data)
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
