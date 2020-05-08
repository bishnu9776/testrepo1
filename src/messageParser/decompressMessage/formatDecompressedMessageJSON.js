export const formatDecompressedMessageJSON = ({decompressedMessage: message, attributes}) => {
  const isCANMessage = attributes.subFolder.includes("can")
  if (isCANMessage) {
    return message.map(x => ({canRaw: x}))
    // Smell: This is so that we're able to support both pre and post big sink at the same time. We can remove this
    // and update CAN parser to directly assume that data is of raw format once we listen only to pre big sink
  }

  return message
}
