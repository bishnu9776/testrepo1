const {env} = process

export const getSubscriberOptions = () => ({
  flowControl: {
    maxMessages: parseInt(env.VI_GCP_PUBSUB_MAX_MESSAGES, 10) || 10,
    maxExtension: parseInt(env.VI_GCP_PUBSUB_MAX_EXTENSION, 10) || 10,
    maxBytes: parseInt(env.VI_GCP_PUBSUB_MAX_BYTES, 10) || 1024 * 1024 * 10 // 10 MB
  },
  streamingOptions: {
    highWaterMark: parseInt(env.VI_GCP_PUBSUB_HIGH_WATERMARK, 10) || 5, // Looks like this will be overridden by maxMessages
    maxStreams: parseInt(env.VI_GCP_PUBSUB_MAX_STREAMS, 10) || 2,
    timeout: parseInt(env.VI_GCP_PUBSUB_TIMEOUT, 10) || 10000
  },
  ackDeadline: parseInt(env.VI_GCP_PUBSUB_ACK_DEADLINE, 10) || 60
  // If this is too low, modifyAckDeadline will be called too many times causing (Request payload size exceeds the limit: 524288 bytes.) error
  // https://github.com/googleapis/nodejs-pubsub/pull/65/files
  // sample ackID has 176 characters which is greater than what's mentioned in ^
})
