import {keys, isNil} from "ramda"
import {log} from "../../../logger"
import {isNilOrEmpty} from "../../../utils/isNilOrEmpty"

// eslint-disable-next-line no-new-func
const createFn = eqn => Function("bytes", `return ${eqn}`)

const convertHexToBytes = value =>
  [
    `${value[0]}${value[1]}`,
    `${value[2]}${value[3]}`,
    `${value[4]}${value[5]}`,
    `${value[6]}${value[7]}`,
    `${value[8]}${value[9]}`,
    `${value[10]}${value[11]}`,
    `${value[12]}${value[13]}`,
    `${value[14]}${value[15]}`
  ].map(s => parseInt(s, 16))

const decodeCANRaw = (canRaw, decoderForCanId) => {
  const {
    can_id: canId,
    data: value,
    timestamp,
    seq_num: seqNum,
    bigsink_timestamp: bsTimestamp,
    bike_id: bikeId,
    global_seq: globalSeq
  } = canRaw

  const bytes = convertHexToBytes(value)
  const dataItems = keys(decoderForCanId)

  return dataItems.map(dataItem => ({
    can_id: canId,
    timestamp,
    seq_num: seqNum,
    key: dataItem,
    value: decoderForCanId[dataItem](bytes),
    bigsink_timestamp: bsTimestamp,
    bike_id: bikeId,
    ...(globalSeq && {global_seq: globalSeq})
  }))
}

const populateDecoderConfig = config => {
  const decoder = {}

  if (isNilOrEmpty(config)) {
    return decoder
  }
  const components = keys(config)
  components.forEach(component => {
    const versions = keys(config[component])
    versions.forEach(version => {
      const canIds = keys(config[component][version])
      canIds.forEach(canId => {
        config[component][version][canId].forEach(e => {
          if (isNil(decoder[`${component}.${version}.${canId}`])) {
            decoder[`${component}.${version}.${canId}`] = {}
          }
          decoder[`${component}.${version}.${canId}`][e.params] = createFn(e.equation)
        })
      })
    })
  })
  return decoder
}

const populateDefaultDecoderConfig = (config, defaultComponentToVersionMapping) => {
  const defaultDecoder = {}
  const legacyComponents = keys(defaultComponentToVersionMapping)

  if (isNilOrEmpty(legacyComponents) || isNilOrEmpty(config)) {
    return defaultDecoder
  }

  legacyComponents.forEach(component => {
    const version = defaultComponentToVersionMapping[component]
    const canIds = keys(config[component][version])
    canIds.forEach(canId => {
      config[component][version][canId].forEach(e => {
        if (isNil(defaultDecoder[`${component}.${version}.${canId}`])) {
          defaultDecoder[`${component}.${version}.${canId}`] = {}
        }
        defaultDecoder[`${component}.${version}.${canId}`][e.params] = createFn(e.equation)
      })
    })
  })
  return defaultDecoder
}

export const decodeCANMessage = (config, defaultComponentToVersionMapping) => {
  const decoder = populateDecoderConfig(config)
  const defaultDecoder = populateDefaultDecoderConfig(config, defaultComponentToVersionMapping)

  return event => {
    const {attributes, data} = event

    return data.map(d => {
      const {can_id: canId} = d.canRaw
      const componentKeys = attributes.channel.split("/")

      if (attributes.channel === "can") {
        const decoderKeys = keys(defaultDecoder)
        const decoderKeyForCanId = decoderKeys.filter(key => new RegExp(canId).test(key))
        if (decoderKeyForCanId.length !== 1) {
          log.error(
            {ctx: {event: JSON.stringify(event, null, 2), keyToCheck: decoderKeyForCanId}},
            "Event does not map to one decoder for its can id"
          )
          return []
        }
        const decoderForCanId = defaultDecoder[decoderKeyForCanId]
        return decodeCANRaw(d.canRaw, decoderForCanId)
      } else {
        const decoderKey = `${componentKeys.join(".")}.${canId}`
        const decoderForCanId = decoder[decoderKey]
        return decodeCANRaw(d.canRaw, decoderForCanId)
      }
    })
  }
}
