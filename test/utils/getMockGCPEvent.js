import zlib from "zlib"
import fs from "fs"

export const getDecompressedGCPEvent = path => {
  const input = JSON.parse(fs.readFileSync(`${process.cwd()}${path}`))
  return {
    data: Buffer.from(input.data.data),
    attributes: input.attributes,
    publishTime: new Date()
  }
}

export const getDeflateCompressedGCPEvent = event => ({
  data: zlib.deflateSync(Buffer.from(JSON.stringify(event.data))),
  attributes: event.attributes,
  publishTime: new Date()
})
