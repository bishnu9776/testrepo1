import {isNilOrEmpty} from "../../utils/isNilOrEmpty"

const isInvalidAttributes = (attributes, indicesToValidate) =>
  indicesToValidate.some(index => isNilOrEmpty(attributes[index]))

const isCANChannelWithComponentRequired = channel =>
  (channel !== "can_default" || channel !== "can_raw") && channel.match(/^can/)

export const getAttributesForGen1 = (headers, metricRegistry) => {
  if (headers && headers[0].inputTopic) {
    const attributesObj = headers[0].inputTopic.toString().split(".")
    const deviceAttributeIndex = 3
    const versionAttributeIndex = deviceAttributeIndex + 2
    const channelAttributeIndex = deviceAttributeIndex + 3
    const componentAttributesIndex = deviceAttributeIndex + 4

    if (isInvalidAttributes(attributesObj, [deviceAttributeIndex, versionAttributeIndex, channelAttributeIndex])) {
      metricRegistry.updateStat("Counter", "num_events_dropped", 1, "invalid_attributes")
      throw new Error(`Device/channel not present, topic: ${headers[0].inputTopic}`)
    }

    const channel = attributesObj[channelAttributeIndex]
    const component = attributesObj[componentAttributesIndex]

    if (isCANChannelWithComponentRequired(channel) && isNilOrEmpty(component)) {
      metricRegistry.updateStat("Counter", "num_events_dropped", 1, "invalid_component")
      throw new Error(`Component is not present, topic: ${headers[0].inputTopic}`)
    }

    const subFolder = !isNilOrEmpty(attributesObj[componentAttributesIndex])
      ? `${attributesObj[versionAttributeIndex]}/${attributesObj[channelAttributeIndex]}/${attributesObj[componentAttributesIndex]}`
      : `${attributesObj[versionAttributeIndex]}/${attributesObj[channelAttributeIndex]}`

    return {
      deviceId: attributesObj[deviceAttributeIndex],
      subFolder
    }
  }
  throw new Error(`Invalid headers`)
}

export const getAttributesForGen2 = (headers, metricRegistry) => {
  if (headers && headers[0].inputTopic) {
    const attributesObj = headers[0].inputTopic.toString().split(".")
    let deviceAttributeIndex = 2
    const gen2AttributeRegex = new RegExp("gen-2", "gi")
    const isNewAttributeStructure = gen2AttributeRegex.test(attributesObj[2])
    if (isNewAttributeStructure) {
      deviceAttributeIndex += 1
    }
    const versionAttributeIndex = deviceAttributeIndex + 2
    const componentAttributeIndex = deviceAttributeIndex + 3
    if (isInvalidAttributes(attributesObj, [deviceAttributeIndex, versionAttributeIndex, componentAttributeIndex])) {
      metricRegistry.updateStat("Counter", "num_events_dropped", 1, "invalid_attributes")
      throw new Error(`Device/channel not present, topic: ${headers[0].inputTopic}`)
    }

    return {
      deviceId: attributesObj[deviceAttributeIndex],
      subFolder: `${attributesObj[versionAttributeIndex]}/${attributesObj[componentAttributeIndex]}`
    }
  }
  throw new Error(`Invalid headers`)
}

export const getAttributesForGen = (gen, appContext) => {
  const {log} = appContext
  const genToGetAttributeFnMap = {
    "gen-1": getAttributesForGen1,
    "gen-2": getAttributesForGen2
  }
  if (genToGetAttributeFnMap[gen]) {
    return genToGetAttributeFnMap[gen]
  }

  log.error(`genAttribute mapping not defined for gen: ${gen}`)
  throw new Error(`genAttribute mapping not defined for gen: ${gen}`)
}
