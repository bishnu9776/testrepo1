import {PubSub} from "@google-cloud/pubsub"
import {Observable} from "rxjs"
import {errorFormatter} from "./utils/errorFormatter"

const {env} = process
const parseNumber = string => {
  return string ? parseInt(string, 10) : false
}

const parseableChannels = ["mcu", "can", "gps_tpv", "heman"]
export const getGCPstream = ({subscriptionName, credentialsPath, projectId, log, metricRegistry}) => {
  function acknowledgeMessage(message) {
    message.ack()
  }

  const stream = new Observable(observer => {
    const pubsubClient = new PubSub({
      projectId,
      keyFilename: credentialsPath
    })

    const subscriberOptions = {
      flowControl: {
        maxMessages: parseNumber(env.VI_GCP_PUBSUB_MAX_MESSAGES) || 10,
        maxExtension: parseNumber(env.VI_GCP_PUBSUB_MAX_EXTENSION) || 10,
        maxBytes: parseNumber(env.VI_GCP_PUBSUB_MAX_BYTES) || 1024 * 1024 * 10 // 10 MB
      },
      streamingOptions: {
        highWaterMark: parseNumber(env.VI_GCP_PUBSUB_HIGH_WATERMARK) || 5, // Looks like this will be overridden by maxMessages
        maxStreams: parseNumber(env.VI_GCP_PUBSUB_MAX_STREAMS) || 2,
        timeout: parseNumber(env.VI_GCP_PUBSUB_TIMEOUT) || 10000
      },
      ackDeadline: parseNumber(env.VI_GCP_PUBSUB_ACK_DEADLINE) || 10
      // If this is too low, modifyAckDeadline will be called too many times causing (Request payload size exceeds the limit: 524288 bytes.) error
      // https://github.com/googleapis/nodejs-pubsub/pull/65/files
      // sample ackID has 176 characters which is greater than what's mentioned in ^
    }

    log.info({ctx: {config: JSON.stringify(subscriberOptions, null, 2)}}, "Connecting to GCP")
    const subscription = pubsubClient.subscription(subscriptionName, subscriberOptions)

    // There is no event emitted to identify successful connection to GCP. Will rely on source stats.

    subscription.on("message", msg => {
      if (!parseableChannels.includes(msg.attributes.channel)) {
        metricRegistry.updateStat("Counter", "num_messages_received", 1, {type: "raw"})
        observer.next(msg)
      }
    })

    subscription.on("error", error => {
      log.warn({error: errorFormatter(error)}, "Error on GCP stream")
      observer.error(error)
    })

    return async () => {
      log.info("Unsubscribing GCP client")
      subscription.removeAllListeners("error")
      subscription.removeAllListeners("event")
      subscription.close()
      // https://github.com/ReactiveX/rxjs/issues/4222. This should be long enough to give time for clearing buffer and sending ACKs/NACKs before we retry the observable chain
      // https://github.com/googleapis/nodejs-pubsub/issues/725
    }
  })

  return {
    acknowledgeMessage,
    stream
  }
}
