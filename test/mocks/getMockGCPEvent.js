import zlib from "zlib"

export const getDecompressedGCPEvent = event => ({
  data: Buffer.from(JSON.stringify(event.data)),
  attributes: event.attributes,
  publishTime: new Date()
})

export const getCompressedGCPEvent = event => ({
  data: zlib.gzipSync(Buffer.from(JSON.stringify(event.data))),
  attributes: event.attributes,
  publishTime: new Date()
})
