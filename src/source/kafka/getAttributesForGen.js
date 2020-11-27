import {isNilOrEmpty} from "../../utils/isNilOrEmpty"

const isInvalidAttributes = (attributes, indicesToValidate) =>
  indicesToValidate.some(index => isNilOrEmpty(attributes[index]))

export const getAttributesForGen1 = (headers, metricRegistry) => {
  if (headers && headers[0].inputTopic) {
    const attributesObj = headers[0].inputTopic.toString().split(".")
    const deviceAttributeIndex = 3
    const versionAttributeIndex = deviceAttributeIndex + 2
    const componentAttributeIndex = deviceAttributeIndex + 3
    if (isInvalidAttributes(attributesObj, [deviceAttributeIndex, versionAttributeIndex, componentAttributeIndex])) {
      metricRegistry.updateStat("Counter", "num_events_dropped", 1, "invalid_attributes")
      throw new Error(`Device/channel not present, topic: ${headers[0].inputTopic}`)
    }
    return {
      deviceId: attributesObj[3],
      subFolder: `${attributesObj[5]}/${attributesObj[6]}`
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
