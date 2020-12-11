import {concatMap, filter, groupBy, map, mergeMap, tap, timeout} from "rxjs/operators"
import {from} from "rxjs"
import {complement, isEmpty, prop} from "ramda"
import {getMessageParser} from "../messageParser"
import {getKafkaSender} from "../kafkaProducer"
import {retryWithExponentialBackoff} from "../utils/retryWithExponentialBackoff"
import {ACK_MSG_TAG} from "../constants"
import {getEventFormatter, isValid} from "../utils/helpers"
import {errorFormatter} from "../utils/errorFormatter"
import {delayAndExit} from "../utils/delayAndExit"
import {loadFileFromAbsolutePath} from "../utils/loadFileFromAbsolutePath"
import {getDeviceInfoHandler} from "../deviceModel/getDeviceInfoHandler"
import {getProbeAppender} from "../probeAppender/getProbeAppender"
import {getAttributesFormatter} from "../messageParser/getAttributesFormatter"
import {getInputMessageTags} from "../metrics/tags"

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
    log.info("GCP stream completed. Exiting application")
    delayAndExit(4)
  },
  error: error => {
    log.error({error: errorFormatter(error)}, "Error on pipeline stream. Exiting application")
    delayAndExit(5)
  }
})

const formatAttributesAndAckMessageIfInvalid = metricRegistry => {
  const formatAttributes = getAttributesFormatter(metricRegistry)

  return e => {
    const formattedAttributes = formatAttributes(e.message.attributes)
    if (formattedAttributes) {
      return {
        message: {
          ...e.message,
          attributes: formattedAttributes
        },
        acknowledgeMessage: e.acknowledgeMessage
      }
    }

    e.acknowledgeMessage()
    return null
  }
}

const filterEventsBasedOnChannelAndDevice = metricRegistry => {
  const channelsToDrop = env.VI_CHANNELS_TO_DROP ? env.VI_CHANNELS_TO_DROP.split(",") : []
  const shouldFilterDevice = JSON.parse(env.VI_SHOULD_FILTER_DEVICE || "false")
  const deviceFilterRegex = new RegExp(env.VI_DEVICE_FILTER_REGEX || ".*")

  const shouldDropChannel = channel => Array.isArray(channelsToDrop) && channelsToDrop.includes(channel)
  const shouldDropDevice = device => (shouldFilterDevice ? !deviceFilterRegex.test(device) : false)

  return event => {
    const {message, acknowledgeMessage} = event

    const {attributes} = message

    if (shouldDropChannel(attributes.channel) || shouldDropDevice(attributes.device_id)) {
      metricRegistry.updateStat("Counter", "num_input_messages_dropped", 1, getInputMessageTags(message))
      acknowledgeMessage()
      return false
    }

    return true
  }
}

export const getPipeline = async ({appContext, observer, probePath, source, kafkaProducer}) => {
  const {log, metricRegistry} = appContext
  const probe = loadFileFromAbsolutePath(probePath, log)

  const {stream} = source

  const sendToKafka = getKafkaSender({kafkaProducer, appContext})
  const parseMessage = getMessageParser({appContext, probe})
  const formatEvent = getEventFormatter()
  const appendProbeOnNewDevice = getProbeAppender({appContext, probe})
  const {updateDeviceInfo} = await getDeviceInfoHandler(appContext)

  return stream
    .pipe(
      timeout(eventTimeout),
      map(formatAttributesAndAckMessageIfInvalid(metricRegistry)),
      filter(x => !!x),
      filter(filterEventsBasedOnChannelAndDevice(metricRegistry)),
      mergeMap(event => from(parseMessage(event))),
      filter(complement(isEmpty)),
      concatMap(events => from(events)), // previous from returns a promise which resolves to an array
      filter(isValid), // After finalising all parsers, remove this.
      map(formatEvent),
      groupBy(prop("device_uuid")),
      mergeMap(deviceObs => deviceObs.pipe(concatMap(updateDeviceInfo))),
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
