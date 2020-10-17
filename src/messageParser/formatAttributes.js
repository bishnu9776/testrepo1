const attributesFormatter = {
  bike: attributes => {
    const {subFolder, deviceId} = attributes
    const isNonLegacyMessage = subFolder.includes("v1/")

    if (isNonLegacyMessage) {
      return {
        channel: subFolder.split("/").slice(1).join("/"),
        version: subFolder.split("/")[0],
        bike_id: deviceId,
        device_id: deviceId
      }
    }

    return {
      channel: subFolder,
      bike_id: deviceId,
      version: "legacy",
      device_id: deviceId
    }
  },
  ci: attributes => {
    const isPreBigSink = JSON.parse(process.env.VI_CI_PRE_BIG_SINK_MODE || "false")

    if (isPreBigSink) {
      return {
        channel: attributes.subFolder.split("/").slice(1).join("/"),
        version: attributes.subFolder.split("/")[0],
        bike_id: attributes.deviceId
      }
    }

    if (attributes.channel === "can") {
      const deviceId = attributes.db_id || attributes.bike_id
      return {...attributes, bike_id: deviceId, device_id: deviceId}
    }
    return attributes
  }
}

export const getAttributesFormatter = () => attributesFormatter[process.env.VI_INPUT_TYPE || "bike"]
