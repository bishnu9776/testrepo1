import {errorFormatter} from "../../utils/errorFormatter"
import {isNilOrEmpty} from "../../utils/isNilOrEmpty"
import {getInputMessageTags} from "../../metrics/tags"

const isInvalidAttributes = (attributes, indicesToValidate) =>
  indicesToValidate.some(index => isNilOrEmpty(attributes[index]))

const getAttributesForGen1 = (headers, metricRegistry) => {
  if (headers && headers[0].inputTopic) {
    const attributesObj = headers[0].inputTopic.toString().split(".")
    if (isInvalidAttributes(attributesObj)) {
      metricRegistry.updateStat("Counter", "num_events_dropped", 1, "invalid_attributes")
      throw new Error(`Device/channel not present, topic: ${headers[0].inputTopic}`)
    }
    return {
      deviceId: attributesObj[3],
      subFolder: `${attributesObj[5]}/${attributesObj[6]}`
    }
  }
  throw new Error(`Invalid headers`)
}

export const getAttributesForGen2 = (headers, metricRegistry) => {
  if (headers && headers[0].inputTopic) {
    const attributesObj = headers[0].inputTopic.toString().split(".")
    let deviceAttributeIndex = 2
    const gen2AttributeRegex = new RegExp("gen-2", "gi")
    const isNewAttributeStructure = gen2AttributeRegex.test(attributesObj[2])
    if (isNewAttributeStructure) {
      deviceAttributeIndex += 1
    }
    const versionAttributeIndex = deviceAttributeIndex + 2
    const componentAttributeIndex = deviceAttributeIndex + 3
    if (isInvalidAttributes(attributesObj, [deviceAttributeIndex, versionAttributeIndex, componentAttributeIndex])) {
      metricRegistry.updateStat("Counter", "num_events_dropped", 1, "invalid_attributes")
      throw new Error(`Device/channel not present, topic: ${headers[0].inputTopic}`)
    }

    return {
      deviceId: attributesObj[deviceAttributeIndex],
      subFolder: `${attributesObj[versionAttributeIndex]}/${attributesObj[componentAttributeIndex]}`
    }
  }
  throw new Error(`Invalid headers`)
}

const getAttributesForGen = gen => {
  const genToGetAttributeFnMap = {
    "gen-1": getAttributesForGen1,
    "gen-2": getAttributesForGen2
  }
  return genToGetAttributeFnMap[gen]
}

const getParseEvent = appContext => {
  const getAttributes = getAttributesForGen(process.env.VI_GEN)
  return (event, resolve) => {
    const {value, headers} = event
    const {log, metricRegistry} = appContext
    try {
      const attributes = getAttributes(headers, metricRegistry)
      if (event && isNilOrEmpty(value)) {
        metricRegistry.updateStat("Counter", "num_events_dropped", 1, "parse_failure")
        throw new Error(`Invalid Event value, event:${JSON.stringify(event)}`)
      }
      metricRegistry.updateStat("Counter", "num_messages_received", 1, getInputMessageTags({attributes}))
      return {
        message: {
          data: event.value,
          attributes
        }
      }
    } catch (e) {
      log.warn(
        {error: errorFormatter(e), ctx: {value: JSON.stringify(value), headers: JSON.stringify(headers)}},
        `${e.message}`
      )
      resolve(event)
    }
  }
}

export const kafkaStream = (appContext, observer) => {
  const sendToObserver = (event, ack) => {
    const acknowledgeMessage = isNilOrEmpty(ack) ? () => {} : ack
    if (!isNilOrEmpty(event)) {
      observer.next({...event, acknowledgeMessage})
    }
  }

  const parseEvent = getParseEvent(appContext)

  return batch => {
    return new Promise(resolve => {
      const acknowledgeMessage = event => {
        return resolve(event)
      }
      const lastEvent = batch.pop()
      batch.forEach(event => {
        const parsedEvent = parseEvent(event, resolve)
        sendToObserver(parsedEvent)
      })
      const parsedLastEvent = parseEvent(lastEvent, resolve)
      sendToObserver(parsedLastEvent, acknowledgeMessage)
    })
  }
}
