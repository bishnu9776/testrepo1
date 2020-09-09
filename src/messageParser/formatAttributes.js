const attributesFormatter = {
  bike: attributes => {
    const {subFolder, deviceId, version, channel} = attributes
    const isNonLegacyMessage = subFolder.includes("v1/")

    // We get version and channel for CI. Factor this out as strategy for CI
    if (version) {
      return {
        channel,
        bike_id: deviceId, // TODO: Remove bike_id
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
  ci: attributes => attributes
}

export const getAttributesFormatter = () => attributesFormatter[process.env.VI_INPUT_TYPE || "bike"]
