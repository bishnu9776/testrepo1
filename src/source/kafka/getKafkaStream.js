import {errorFormatter} from "../../utils/errorFormatter"

const {env} = process

const getDevice = (topic, metricRegistry) => {
  const regex = env.VI_KAFKA_SOURCE_DEVICE_REGEX
  const decodedTopic = String.fromCharCode.apply(null, new Uint16Array(topic))
  if (decodedTopic.match(regex)) {
    return decodedTopic.match(regex)[1]
  }
  metricRegistry.updateStat("Counter", "num_events_dropped", 1, "regex_mismatch")
  throw new Error(`Regex doesn't match a device in the topic ${regex}, decodedTopic: ${decodedTopic}`)
}

const parseMessage = (value, metricRegistry) => {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch (e) {
    metricRegistry.updateStat("Counter", "num_events_dropped", 1, "parse_failure")
    throw new Error(e, "Failed to parse the message")
  }
}

export const getKafkaStream = (appContext, observer) => {
  const {log, metricRegistry} = appContext

  return event => {
    return new Promise(resolve => {
      const acknowledgeMessage = () => resolve(event)
      const {value, headers} = event
      try {
        const topicObj = headers ? parseMessage(headers[0].inputTopic) : null
        const device = getDevice(topicObj?.data, metricRegistry)
        const {data} = parseMessage(value, metricRegistry)
        metricRegistry.updateStat("Counter", "num_events_consumed", 1, "")
        observer.next({message: {data, attributes: {bike_id: device}}, acknowledgeMessage})
      } catch (e) {
        log.warn({error: errorFormatter(e), ctx: {value: JSON.stringify(value), headers: JSON.stringify(headers)}})
        observer.next()
      }
    })
  }
}
