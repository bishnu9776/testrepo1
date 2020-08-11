const {env} = process

const getDevice = topic => {
  const regex = env.VI_REGEX_DEVICE_FROM_TOPIC
  const decodedTopic = String.fromCharCode.apply(null, new Uint16Array(topic))
  return decodedTopic.match(regex)[1]
}

const parseMessage = value => JSON.parse(JSON.stringify(value))

export const getKafkaStream = (appContext, observer) => {
  // eslint-disable-next-line no-unused-vars
  const {log, metricRegistry} = appContext
  /**
   * create stream with data and attributes: {bike_id: topic}
   * create acknowledgeMessage function
   */

  return event => {
    return new Promise(resolve => {
      const acknowledgeMessage = () => resolve(event)
      const {value, headers} = event
      const topicObj = parseMessage(headers[0].inputTopic)
      const device = getDevice(topicObj.data)
      const {data} = parseMessage(value)
      observer.next({message: {data, attributes: {bike_id: device}}, acknowledgeMessage})
      return {message: event}
    })
  }
}
