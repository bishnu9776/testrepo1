export const getMockGCPEvent = event => ({
  data: Buffer.from(JSON.stringify(event.data)),
  attributes: event.attributes,
  publishTime: new Date()
})
