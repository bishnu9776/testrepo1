import {errorFormatter} from "../../utils/errorFormatter"
import {isNilOrEmpty} from "../../utils/isNilOrEmpty"

const getAttributes = (headers, metricRegistry) => {
  if (headers && headers[0].inputTopic) {
    const attributesObj = headers[0].inputTopic.toString().split(".")
    if (isNilOrEmpty(attributesObj[2])) {
      metricRegistry.updateStat("Counter", "num_events_dropped", 1, "device_not_present")
      throw new Error(`Device not present, topic: ${headers[0].inputTopic}`)
    }
    return {
      devicId: attributesObj[2],
      subFolder: `${attributesObj[4]}/${attributesObj[5]}`
    }
  }
  throw new Error(`Invalid headers`)
}

export const kafkaStream = (appContext, observer) => {
  const {log, metricRegistry} = appContext
  return event => {
    return new Promise(resolve => {
      const acknowledgeMessage = () => resolve(event)
      const {value, headers} = event
      try {
        const attributes = getAttributes(headers, metricRegistry)
        if (event && isNilOrEmpty(value)) {
          metricRegistry.updateStat("Counter", "num_events_dropped", 1, "parse_failure")
          throw new Error(`Invalid Event value, event:${JSON.stringify(event)}`)
        }
        metricRegistry.updateStat("Counter", "num_messages_received", 1)
        observer.next({
          message: {
            data: event.value,
            attributes
          },
          acknowledgeMessage
        })
      } catch (e) {
        log.warn({error: errorFormatter(e), ctx: {value: JSON.stringify(value), headers: JSON.stringify(headers)}})
        resolve(event)
      }
    })
  }
}
