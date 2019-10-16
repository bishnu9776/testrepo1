import zlib from "zlib"

export const getMockGCPEvent = event => ({
  data: Buffer.from(JSON.stringify(event.data)),
  attributes: event.attributes,
  publishTime: new Date()
})

export const getCompressedMockGCPEvent = event => ({
  data: zlib.gzipSync(Buffer.from(JSON.stringify(event.data))),
  attributes: event.attributes,
  publishTime: new Date()
})
