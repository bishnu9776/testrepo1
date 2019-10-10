import {PubSub} from "@google-cloud/pubsub"
import {Observable} from "rxjs"
// import zlib from "zlib"

export const getGCPstream = ({subscriptionName, credentialsPath, projectId}) => {
  return new Observable(observer => {
    const pubsubclient = new PubSub({
      projectId,
      keyFilename: credentialsPath
    })

    const startTime = new Date()

    const maxMessagesToConsume = 50
    let numMessagesConsumed = 0

    const subscriberOptions = {
      flowControl: {
        maxMessages: 20000
      },
      streamingOptions: {
        highWaterMark: 10000,
        maxStreams: 5,
        timeout: 30 * 1000
      }
    }

    const subscription = pubsubclient.subscription(subscriptionName, subscriberOptions)
    subscription.on("message", message => {
      numMessagesConsumed++
      if (numMessagesConsumed === maxMessagesToConsume) {
        const endTime = new Date()
        const processingTime = (endTime - startTime) / 1000
        console.log(`Got ${maxMessagesToConsume} events. Closing input stream`)
        // console.log(
        //   `Processed ${maxMessagesToConsume} in ${processingTime} seconds at the rate of ${maxMessagesToConsume /
        //     processingTime} events / second`
        // )
        observer.complete()
      }
      message.ack()
      observer.next({
        meta: {ackId: message.ackId},
        parsedMessage: JSON.parse(message.data.toString()),
        tag: "MTConnectDataItems"
      })
    })

    subscription.on("error", err => {
      console.log("Got error", err)
      observer.error(err)
    })

    return () => {
      console.log("Unsubscribing source")
      subscription.removeAllListeners("error")
      subscription.removeAllListeners("event")
      subscription.close() // https://github.com/ReactiveX/rxjs/issues/4222
    }
  })
}

// TODO: Add retry policy
// TODO: Add stats
