const {env} = process

export const getRoutingConfig = () => {
  const dataTopics = env.VI_KAFKA_SINK_DATA_TOPICS ? env.VI_KAFKA_SINK_DATA_TOPICS.split(",") : ["test-topic-ather"]
  const archiveTopics = env.VI_KAFKA_SINK_ARCHIVE_TOPICS
    ? env.VI_KAFKA_SINK_ARCHIVE_TOPICS.split(",")
    : ["test-archive-topic-ather"]
  const canRawTopics = env.VI_KAFKA_SINK_CANRAW_TOPICS
    ? env.VI_KAFKA_SINK_CANRAW_TOPICS.split(",")
    : ["test-canraw-topic-ather"]
  const whitelistedDataItems = env.VI_DATAITEM_WHITELIST ? env.VI_DATAITEM_WHITELIST.split(",") : []
  const whitelistedCanRawDataItems = env.VI_CANRAW_DATAITEM_WHITELIST ? env.VI_CANRAW_DATAITEM_WHITELIST.split(",") : []

  return [
    {
      filter: e => whitelistedDataItems.includes(e.data_item_name),
      topics: dataTopics
    },
    {
      filter: e => e.tag === "MTConnectDataItems" && !whitelistedCanRawDataItems.includes(e.data_item_name),
      topics: archiveTopics
    },
    {
      filter: e => whitelistedCanRawDataItems.includes(e.data_item_name),
      topics: canRawTopics
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
