const attributesFormatter = {
  bike: attributes => {
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
  },
  ci: attributes => {
    if (attributes.channel === "can") {
      return {...attributes, bike_id: attributes.db_id || attributes.bike_id}
    }
    return attributes
  }
}

export const getAttributesFormatter = () => attributesFormatter[process.env.VI_INPUT_TYPE || "bike"]
