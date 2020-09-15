import {concatMap, filter, map, mergeMap, tap, timeout} from "rxjs/operators"
import {from} from "rxjs"
import {complement, isEmpty} from "ramda"
import {getMessageParser} from "../messageParser"
import {getKafkaSender} from "../kafkaProducer"
import {retryWithExponentialBackoff} from "../utils/retryWithExponentialBackoff"
import {ACK_MSG_TAG} from "../constants"
import {getEventFormatter, isValid} from "../utils/helpers"
import {errorFormatter} from "../utils/errorFormatter"
import {delayAndExit} from "../utils/delayAndExit"
import {loadProbe} from "./loadProbe"
import {getUpdateDeviceModelMapping} from "../deviceModel/getUpdateDeviceModelMapping"
import {createDeviceModelMapping} from "../deviceModel/createDeviceModelMapping"
import {isModelPresentForDevice} from "../deviceModel/isModelPresentForDevice"
// import {getUpdateProbe} from "../getUpdateProbe"

const {env} = process
const eventTimeout = process.env.VI_EVENT_TIMEOUT || 600000

const getPipelineRetryConfig = () => ({
  retryDelayCap: parseInt(env.VI_COLLECTOR_PIPELINE_RETRY_DELAY_CAP_MS, 10) || 30000,
  retryDelayFactor: parseInt(env.VI_COLLECTOR_PIPELINE_RETRY_DELAY_FACTOR, 10) || 2,
  retryDelayInit: parseInt(env.VI_COLLECTOR_PIPELINE_RETRY_DELAY_INIT_MS, 10) || 5000,
  maxRetryAttempts: parseInt(env.VI_COLLECTOR_PIPELINE_MAX_RETRY_ATTEMPTS, 10) || 5
})

const defaultObserver = log => ({
  complete: () => {
    log.error("GCP stream completed. Exiting application")
    delayAndExit(4)
  },
  error: error => {
    log.error({error: errorFormatter(error)}, "Error on pipeline stream. Exiting application")
    delayAndExit(5)
  }
})

export const getPipeline = async ({appContext, observer, probePath, source, kafkaProducer}) => {
  const {log} = appContext
  const probe = loadProbe(probePath, log)

  const {stream} = source

  const sendToKafka = getKafkaSender({kafkaProducer, appContext})
  const parseMessage = getMessageParser({appContext, probe})
  const formatEvent = getEventFormatter()
  const modelDataItems = env.VI_DATAITEM_MODEL_LIST ? env.VI_DATAITEM_MODEL_LIST.split(",") : ["bike_type"]
  const deviceModelMapping = await createDeviceModelMapping(appContext)
  const updateDeviceModelMappingFn = getUpdateDeviceModelMapping(appContext)
  // const updateProbe = getUpdateProbe(appContext, probe)

  const updateDeviceModelMapping = event => {
    if (modelDataItems.includes(event.data_item_name)) {
      updateDeviceModelMappingFn(deviceModelMapping, event)
    }
  }

  return stream
    .pipe(
      timeout(eventTimeout),
      mergeMap(event => from(parseMessage(event))),
      filter(complement(isEmpty)),
      concatMap(events => from(events)), // previous from returns a promise which resolves to an array
      filter(isValid), // After finalising all parsers, remove this.
      map(formatEvent),
      tap(updateDeviceModelMapping),
      filter(isModelPresentForDevice({deviceModelMapping, log})),
      // mergeMap(event => from(updateProbe(event))),
      sendToKafka,
      tap(event => {
        if (event.tag === ACK_MSG_TAG) {
          event.acknowledgeMessage()
        }
      }),
      retryWithExponentialBackoff({
        ...getPipelineRetryConfig(),
        log
      })
    )
    .subscribe(observer || defaultObserver(log))
}
