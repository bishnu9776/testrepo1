import {concatMap, filter, map, tap} from "rxjs/operators"
import {flatten} from "ramda"
import {from} from "rxjs"
import {getGCPstream} from "./gcpSubscriber"
import {log} from "./logger"
import {formatData} from "./formatData"
import {kafkaProducer} from "./kafkaProducer"

const {env} = process
const subscriptionName = env.VI_GCP_PUBSUB_SUBSCRIPTION || "samplesubscription"
const projectId = env.VI_GCP_PROJECT_ID || "udemy-react-nati-1553102095753"
const credentialsPath = env.VI_GCP_SERVICE_ACCOUNT_CREDS_FILE_PATH || "./src/creds/credentials.json"

const initializeGCPStream = metricRegistry =>
  getGCPstream({
    subscriptionName,
    projectId,
    credentialsPath,
    metricRegistry,
    log
  })

// TODO
// 1. Immediately throw if not able to connect to Kafka
// 2. Add timeout for entire stream if no messages for some time
// 3. Retry with exponential back off on errors
// 4. Make zlib async and use mergeMap
// 5. Client library repeatedly extends the acknowledgement deadline for backlogged messages -> How does this happen? How do we configure this?
// 6. Reproduce a case where message exceeds maxExtension deadline and observe how application reacts
// 7. Decide how to handle uncaught exceptions - exit app or retry chain?
export const getPipeline = ({metricRegistry}) => {
  const {acknowledgeMessage, stream} = initializeGCPStream(metricRegistry)

  return stream.pipe(
    map(formatData({log, metricRegistry})),
    filter(x => !!x),
    map(x => flatten([x])),
    concatMap(events => from(events)),
    kafkaProducer({log, metricRegistry}),
    filter(event => event.type === "ack"),
    tap(event => {
      acknowledgeMessage(event.message)
    })
  )
}
