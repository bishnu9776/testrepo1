import {errorFormatter} from "../../utils/errorFormatter"
import {isNilOrEmpty} from "../../utils/isNilOrEmpty"
import {getMessageTags} from "../../metrics/tags"

const isInvalidAttributes = attributes =>
  isNilOrEmpty(attributes[2]) && isNilOrEmpty(attributes[5]) && isNilOrEmpty(attributes[5])

const getAttributes = (headers, metricRegistry) => {
  if (headers && headers[0].inputTopic) {
    const attributesObj = headers[0].inputTopic.toString().split(".")
    if (isInvalidAttributes(attributesObj)) {
      metricRegistry.updateStat("Counter", "num_events_dropped", 1, "invalid_attributes")
      throw new Error(`Device/channel not present, topic: ${headers[0].inputTopic}`)
    }
    return {
      deviceId: attributesObj[2],
      subFolder: `${attributesObj[4]}/${attributesObj[5]}`
    }
  }
  throw new Error(`Invalid headers`)
}

const parseEvent = (appContext, event, resolve) => {
  const {value, headers} = event
  const {log, metricRegistry} = appContext
  try {
    const attributes = getAttributes(headers, metricRegistry)
    if (event && isNilOrEmpty(value)) {
      metricRegistry.updateStat("Counter", "num_events_dropped", 1, "parse_failure")
      throw new Error(`Invalid Event value, event:${JSON.stringify(event)}`)
    }
    metricRegistry.updateStat("Counter", "num_messages_received", 1, getMessageTags({attributes}))
    return {
      message: {
        data: event.value,
        attributes
      }
    }
  } catch (e) {
    log.warn({error: errorFormatter(e), ctx: {value: JSON.stringify(value), headers: JSON.stringify(headers)}})
    resolve(event)
  }
}

export const kafkaStream = (appContext, observer) => {
  const sendToObserver = (event, ack) => {
    const acknowledgeMessage = isNilOrEmpty(ack) ? () => {} : ack
    if (!isNilOrEmpty(event)) {
      observer.next({...event, acknowledgeMessage})
    }
  }

  return batch => {
    return new Promise(resolve => {
      const acknowledgeMessage = event => {
        return resolve(event)
      }
      const lastEvent = batch.pop()
      batch.forEach(event => {
        const parsedEvent = parseEvent(appContext, event, resolve)
        sendToObserver(parsedEvent)
      })
      const parsedLastEvent = parseEvent(appContext, lastEvent, resolve)
      sendToObserver(parsedLastEvent, acknowledgeMessage)
    })
  }
}
