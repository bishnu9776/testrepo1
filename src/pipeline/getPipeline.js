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
import {loadFileFromAbsolutePath} from "../utils/loadFileFromAbsolutePath"
import {getDeviceInfoHandler} from "../deviceModel/getDeviceInfoHandler"
import {isModelPresentForDevice} from "../deviceModel/isModelPresentForDevice"
import {getProbeAppender} from "../getProbeAppender"

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
  const probe = loadFileFromAbsolutePath(probePath, log)

  const {stream} = source

  const sendToKafka = getKafkaSender({kafkaProducer, appContext})
  const parseMessage = getMessageParser({appContext, probe})
  const formatEvent = getEventFormatter()
  const appendProbeOnNewDevice = getProbeAppender({appContext, probe})
  const {getUpdatedDeviceModelMapping, updateDeviceInfo} = await getDeviceInfoHandler(appContext)

  return stream
    .pipe(
      timeout(eventTimeout),
      mergeMap(event => from(parseMessage(event))),
      filter(complement(isEmpty)),
      concatMap(events => from(events)), // previous from returns a promise which resolves to an array
      filter(isValid), // After finalising all parsers, remove this.
      map(formatEvent),
      tap(updateDeviceInfo),
      filter(isModelPresentForDevice({deviceModelMapping: getUpdatedDeviceModelMapping(), log})),
      mergeMap(event => from(appendProbeOnNewDevice(event))),
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
