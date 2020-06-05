import avro from "avsc"
import Long from "long"
import {formatDecompressedMessageJSON} from "./formatDecompressedMessageJSON"

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

export const deserializeAvro = message => {
  return new Promise((resolve, reject) => {
    const output = []

    const decoder = new avro.streams.BlockDecoder({
      parseHook: schema => {
        return avro.Type.forSchema(schema, {registry: {long: longType}})
      }
    })

    decoder.on("data", data => {
      output.push(data)
    })

    decoder.on("error", error => {
      reject(error)
    })

    decoder.on("finish", () => {
      resolve(formatDecompressedMessageJSON({decompressedMessage: output, attributes: message.attributes}))
    })

    decoder.end(message.data)
  })
}
