import {errorFormatter} from "../../utils/errorFormatter"

const {env} = process

const getDevice = topic => {
  const regex = env.VI_REGEX_DEVICE_FROM_TOPIC
  const decodedTopic = String.fromCharCode.apply(null, new Uint16Array(topic))
  if (decodedTopic.match(regex)) {
    return decodedTopic.match(regex)[1]
  }
  throw new Error(`Regex doesn't match a device in the topic ${regex}`)
}

const parseMessage = value => JSON.parse(JSON.stringify(value))

export const getKafkaStream = (appContext, observer) => {
  const {log} = appContext

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
        const error = errorFormatter(e) || {message: "Error in parsing the message from kafka"}
        log.warn({error, ctx: {value: JSON.stringify(value), headers: JSON.stringify(headers)}})
        observer.next()
      }
    })
  }
}
