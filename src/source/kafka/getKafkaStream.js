// use regex to get the bike_id
const getDevice = topic => String.fromCharCode.apply(null, new Uint16Array(topic))

export const getKafkaStream = appContext => {
  // eslint-disable-next-line no-unused-vars
  const {log, metricRegistry} = appContext
  /**
   * create stream with data and attributes: {bike_id: topic}
   * create acknowledgeMessage function
   */
  return event => {
    const {value, headers} = event
    const topicObj = JSON.parse(JSON.stringify(headers[0].inputTopic))
    const topic = getDevice(topicObj.data)
    return {value, topic}
  }
}
