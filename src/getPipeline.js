import {concatMap, filter, map, mergeMap, tap} from "rxjs/operators"
import {flatten} from "ramda"
import {from} from "rxjs"
import {getGCPstream} from "./gcpSubscriber"
import {log} from "./logger"
import {formatData} from "./formatData/formatData"
import {kafkaProducer} from "./kafkaProducer"
import {retryWithExponentialBackoff} from "./utils/retryWithExponentialBackoff"
import {ACK_MSG_TAG} from "./constants"

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
// 1. Retry with exponential back off on errors
// 2. Resiliency test cases
// 4. Client library repeatedly extends the acknowledgement deadline for backlogged messages -> How does this happen? How do we configure this?
// 5. Reproduce a case where message exceeds maxExtension deadline and observe how application reacts
// 6. Decide how to handle uncaught exceptions - exit app or retry chain?
// 7. Make retry operator a node module
// 8. pipeline.unsubscribe is not a function error
// 9. understand how modifyAckDeadline works

export const getPipeline = ({metricRegistry}) => {
  const {acknowledgeMessage, stream} = initializeGCPStream(metricRegistry)

  return stream.pipe(
    mergeMap(event => from(formatData({log, metricRegistry})(event))),
    filter(x => !!x),
    map(x => flatten([x])),
    concatMap(events => from(events)),
    kafkaProducer({log, metricRegistry}),
    tap(event => {
      if (event.tag === ACK_MSG_TAG) {
        acknowledgeMessage(event.message)
      }
    }),
    retryWithExponentialBackoff({retryDelayCap: 30000, retryDelayFactor: 2, retryDelayInit: 5000, log})
  )
}
