import {PubSub} from "@google-cloud/pubsub"
import {Observable} from "rxjs"
import {errorFormatter} from "./utils/errorFormatter"

// TODO
// 1. Client library repeatedly extends the acknowledgement deadline for backlogged messages -> How does this happen? How do we configure this?
// 2. Reproduce a case where message exceeds maxExtension deadline and observe how application reacts

const {env} = process
const parseNumber = string => {
  string ? parseInt(string, 10) : false
}

export const getGCPstream = ({subscriptionName, credentialsPath, projectId, log, metricRegistry}) => {
  return new Observable(observer => {
    const pubsubClient = new PubSub({
      projectId,
      keyFilename: credentialsPath
    })

    const subscriberOptions = {
      flowControl: {
        maxMessages: parseNumber(env.VI_GCP_PUBSUB_MAX_MESSAGES) || 2000000,
        maxExtension: parseNumber(env.VI_GCP_PUBSUB_MAX_EXTENSION) || 10000,
        maxBytes: parseNumber(env.VI_GCP_PUBSUB_MAX_BYTES) || 1024 * 1024 * 100000 // 100 MB
      },
      streamingOptions: {
        highWaterMark: parseNumber(env.VI_GCP_PUBSUB_HIGH_WATERMARK) || 200000,
        maxStreams: parseNumber(env.VI_GCP_PUBSUB_MAX_STREAMS) || 5,
        timeout: parseNumber(env.VI_GCP_PUBSUB_TIMEOUT) || 5000
      }
    }

    log.info({ctx: {config: subscriberOptions}}, "Connecting to GCP")
    const subscription = pubsubClient.subscription(subscriptionName, subscriberOptions)

    // There is no event emitted to identify successful connection to GCP. Will rely on source stats.

    subscription.on("message", msg => {
      metricRegistry.updateStat("Counter", "num_messages_received", 1, {type: "raw"})

      observer.next({
        meta: {ackId: msg.ackId, id: msg.id, attributes: msg.attributes},
        data: msg.data
      })
    })

    subscription.on("error", error => {
      log.warn({error: errorFormatter(error)}, "Error on GCP stream")
      observer.error(error)
    })

    return async () => {
      log.info("Unsubscribing GCP client")
      subscription.removeAllListeners("error")
      subscription.removeAllListeners("event")
      subscription.close() // https://github.com/ReactiveX/rxjs/issues/4222
    }
  })
}
