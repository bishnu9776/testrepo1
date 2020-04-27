import {keys, isNil} from "ramda"
import {log} from "../../../logger"

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

const decodeData = (canRaw, decodedData, decoder, decoderKey) => {
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
  const dataItems = keys(decoder[decoderKey])

  return dataItems.forEach(dataItem => {
    decodedData.push({
      can_id: canId,
      timestamp,
      seq_num: seqNum,
      key: dataItem,
      value: decoder[decoderKey][dataItem](bytes),
      bigsink_timestamp: bsTimestamp,
      bike_id: bikeId,
      ...(globalSeq && {global_seq: globalSeq})
    })
  })
}

const populateDecoderConfig = config => {
  const decoder = {}
  const components = keys(config)
  components.forEach(component => {
    const variants = keys(config[component])
    variants.forEach(variant => {
      const canIds = keys(config[component][variant])
      canIds.forEach(canId => {
        config[component][variant][canId].forEach(e => {
          if (isNil(decoder[`${component}.${variant}.${canId}`])) {
            decoder[`${component}.${variant}.${canId}`] = {}
          }
          decoder[`${component}.${variant}.${canId}`][e.params] = createFn(e.equation)
        })
      })
    })
  })
  return decoder
}

const populateDefaultDecoderConfig = (defaultVariantToUseForEachComponent, config) => {
  const defaultDecoder = {}
  const legacyComponents = keys(defaultVariantToUseForEachComponent)

  legacyComponents.forEach(component => {
    const variant = defaultVariantToUseForEachComponent[component]
    const canIds = keys(config[component][variant])
    canIds.forEach(canId => {
      config[component][variant][canId].forEach(e => {
        if (isNil(defaultDecoder[`${component}.${variant}.${canId}`])) {
          defaultDecoder[`${component}.${variant}.${canId}`] = {}
        }
        defaultDecoder[`${component}.${variant}.${canId}`][e.params] = createFn(e.equation)
      })
    })
  })
  return defaultDecoder
}

export const canDecoder = (config, defaultVariantToUseForEachComponent) => {
  const decoder = populateDecoderConfig(config)
  const defaultDecoder = populateDefaultDecoderConfig(defaultVariantToUseForEachComponent, config)

  return event => {
    const decodedData = []
    const {attributes, data} = event

    data.forEach(d => {
      const {can_id: canId} = d.canRaw
      const componentKeys = attributes.channel.split("/")

      if (attributes.channel === "can") {
        const decoderKeys = keys(defaultDecoder)
        const decoderKeyForCanId = decoderKeys.filter(key => new RegExp(canId).test(key))
        if (decoderKeyForCanId.length !== 1) {
          log.error(
            {ctx: {event: JSON.stringify(event, null, 2), keyToCheck: decoderKeyForCanId}},
            "Event does not map to one decoderKey for its can id"
          )
          return null
        }
        return decodeData(d.canRaw, decodedData, defaultDecoder, decoderKeyForCanId)
      } else {
        const decoderKey = `${componentKeys.join(".")}.${canId}`
        return decodeData(d.canRaw, decodedData, decoder, decoderKey)
      }
    })
    return decodedData
  }
}
