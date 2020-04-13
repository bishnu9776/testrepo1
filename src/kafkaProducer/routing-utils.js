const {env} = process

export const getRoutingConfig = () => {
  const dataTopics = env.VI_KAFKA_SINK_DATA_TOPICS ? env.VI_KAFKA_SINK_DATA_TOPICS.split(",") : ["test-topic-ather"]
  const archiveTopics = env.VI_KAFKA_SINK_ARCHIVE_TOPICS
    ? env.VI_KAFKA_SINK_ARCHIVE_TOPICS.split(",")
    : ["test-archive-topic-ather"]
  const whitelistedDataItems = env.VI_DATAITEM_WHITELIST ? env.VI_DATAITEM_WHITELIST.split(",") : []

  return [
    {
      filter: e => whitelistedDataItems.includes(e.data_item_name),
      topics: dataTopics
    },
    {
      filter: e => e.tag === "MTConnectDataItems",
      topics: archiveTopics
    }
  ]
}
export const getTopics = (event, routes) =>
  routes.reduce((acc, route) => {
    if (route.filter(event)) {
      return [...acc, ...route.topics]
    }
    return acc
  }, [])

export const getMessageKey = e => e.device_uuid || null
