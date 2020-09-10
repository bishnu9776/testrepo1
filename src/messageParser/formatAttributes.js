const attributesFormatter = {
  bike: attributes => {
    const {subFolder, deviceId, version, channel} = attributes
    const isNonLegacyMessage = subFolder.includes("v1/")

    if (version) {
      return {
        channel,
        bike_id: deviceId,
        version
      }
    }

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
  // TODO: Switch to a common deviceId representation in formatted attributes instead of calling it bike_id
  ci: attributes => {
    if (attributes.channel === "can") {
      return {...attributes, bike_id: attributes.db_id} // TODO: Clarify on why CAN channel alone has this
    }
    return attributes
  }
}

export const getAttributesFormatter = () => attributesFormatter[process.env.VI_INPUT_TYPE || "bike"]
