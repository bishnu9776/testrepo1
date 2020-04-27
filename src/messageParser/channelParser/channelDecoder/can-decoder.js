import {keys, isNil, head} from "ramda"

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

const decodeData = (canRaw, parsedData, decoder, keyToCheck) => {
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
  const dataItemKeys = keys(decoder[keyToCheck])

  return dataItemKeys.forEach(key => {
    parsedData.push({
      can_id: canId,
      timestamp,
      seq_num: seqNum,
      key,
      value: decoder[keyToCheck][key](bytes),
      bigsink_timestamp: bsTimestamp,
      bike_id: bikeId,
      ...(globalSeq && {global_seq: globalSeq})
    })
  })
}

export const canDecoder = (config, defaultVariantToUseForEachComponent) => {
  const decoder = {}
  const defaultDecoder = {}
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

  return event => {
    const parsedData = []
    const {attributes, data} = event

    data.forEach(d => {
      const {can_id: canId} = d.canRaw
      const componentKeys = attributes.channel.split("/")
      if (attributes.channel === "can") {
        const parserKeys = keys(defaultDecoder)
        // TODO: log error if multiple components have same code or if code is not present.
        const keyToCheck = head(parserKeys.filter(key => new RegExp(canId).test(key)))
        return decodeData(d.canRaw, parsedData, defaultDecoder, keyToCheck)
      } else {
        const keyToCheck = `${componentKeys.join(".")}.${canId}`
        return decodeData(d.canRaw, parsedData, decoder, keyToCheck)
      }
    })
    return parsedData
  }
}
