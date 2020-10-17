const attributesFormatter = metricRegistry => ({
  bike: attributes => {
    try {
      const {subFolder, deviceId} = attributes
      const isNonLegacyMessage = subFolder.includes("v1/")

      if (isNonLegacyMessage) {
        return {
          channel: subFolder.split("/").slice(1).join("/"),
          version: subFolder.split("/")[0],
          bike_id: deviceId
        }
      }

      return {
        channel: subFolder,
        bike_id: deviceId,
        version: "legacy"
      }
    } catch (e) {
      metricRegistry.updateStat("Counter", "num_invalid_attributes_events", 1, attributes)
      return null
    }
  },
  // TODO: Instead of using the word bike_id, use device_id and update all channel parser tests to be given the formatted attributes
  ci: attributes => {
    try {
      const isPreBigSink = JSON.parse(process.env.VI_CI_PRE_BIG_SINK_MODE || "false")
      const {subFolder, deviceId} = attributes

      if (isPreBigSink) {
        return {
          channel: subFolder.split("/").slice(1).join("/"),
          version: subFolder.split("/")[0],
          bike_id: deviceId
        }
      }

      const deviceid = attributes.db_id || attributes.bike_id
      return {channel: attributes.channel, version: attributes.version, bike_id: deviceid}
    } catch (e) {
      metricRegistry.updateStat("Counter", "num_invalid_attributes_events", 1, attributes)
      return null
    }
  }
})

// TODO: Only src should use this. Remove usages from tests
export const getAttributesFormatter = metricRegistry => {
  return attributesFormatter(metricRegistry)[process.env.VI_INPUT_TYPE || "bike"]
}
