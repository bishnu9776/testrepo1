import {errorFormatter} from "../../utils/errorFormatter"

const {env} = process

const getDevice = topic => {
  const regex = env.VI_REGEX_DEVICE_FROM_TOPIC
  const decodedTopic = String.fromCharCode.apply(null, new Uint16Array(topic))
  if (decodedTopic.match(regex)) {
    return decodedTopic.match(regex)[1]
  }
  throw new Error("Regex doesn't match a device name in the topic")
}

const parseMessage = value => JSON.parse(JSON.stringify(value))

export const getKafkaStream = (appContext, observer) => {
  // eslint-disable-next-line no-unused-vars
  const {log, metricRegistry} = appContext

  return event => {
    return new Promise(resolve => {
      const acknowledgeMessage = () => resolve(event)
      const {value, headers} = event
      try {
        const topicObj = parseMessage(headers[0]?.inputTopic)
        const device = getDevice(topicObj?.data)
        const {data} = parseMessage(value)
        observer.next({message: {data, attributes: {bike_id: device}}, acknowledgeMessage})
      } catch (e) {
        log.warn(
          {error: errorFormatter(e), ctx: {value: JSON.stringify(value), headers: JSON.stringify(headers)}},
          "Error in parsing the message from kafka"
        )
        observer.next()
      }
    })
  }
}
