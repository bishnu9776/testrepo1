import {PubSub} from "@google-cloud/pubsub"
import {Observable} from "rxjs"
import {errorFormatter} from "../../utils/errorFormatter"
import {getSubscriberOptions} from "./config"
import {getInputMessageTags} from "../../metrics/tags"

export const getGCPStream = ({subscriptionName, credentialsPath, projectId, appContext}) => {
  const {log, metricRegistry} = appContext
  const stream = new Observable(observer => {
    const pubsubClient = new PubSub({
      projectId,
      keyFilename: credentialsPath
    })
    const subscriberOptions = getSubscriberOptions()
    const subscription = pubsubClient.subscription(subscriptionName, subscriberOptions)

    // There is no event emitted to identify successful connection to GCP. Will rely on source stats.
    log.info(
      {ctx: {config: JSON.stringify(subscriberOptions, null, 2)}},
      `Connecting to GCP subscription: ${subscriptionName}`
    )

    subscription.on("message", msg => {
      const acknowledgeMessage = () => {
        msg.ack()
      }
      metricRegistry.updateStat("Counter", "num_messages_received", 1, getInputMessageTags(msg))
      observer.next({message: msg, acknowledgeMessage})
    })

    subscription.on("error", error => {
      log.warn({error: errorFormatter(error)}, "Error on GCP subscription")
      observer.error(error)
    })

    return () => {
      subscription.removeAllListeners()
      subscription
        .close()
        .then(() => {
          log.info(`Unsubscribed GCP client for subscription ${subscriptionName}`)
        })
        .catch(err => {
          log.info({error: errorFormatter(err)}, "Error when unsubscribing GCP client. Continuing.")
        })
      // https://github.com/ReactiveX/rxjs/issues/4222. This should be long enough to give time for clearing buffer and sending ACKs/NACKs before we retry the observable chain
      // https://github.com/googleapis/nodejs-pubsub/issues/725
    }
  })

  return {
    stream
  }
}
