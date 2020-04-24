import {keys, isNil} from "ramda"
/**
 * should get the pasrer config
 * create configObj with function
 * create defaultConfig for legacy
 */

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

export const canParser = config => {
  const parser = {}
  const defaultParser = {}
  const components = keys(config)

  // get it from outside.
  const defaultVariantToUseForEachComponent = {
    can_charger: "MK3",
    can_motor: "MAHLEX1",
    can_bms: "v4_1_0",
    can_mcu: "v1_0_0",
    can_pod: "LPCv1"
  }

  components.forEach(component => {
    const variants = keys(config[component])
    variants.forEach(variant => {
      const canIds = keys(config[component][variant])
      canIds.forEach(canId => {
        config[component][variant][canId].forEach(e => {
          if (isNil(parser[`${component}.${variant}.${canId}`])) {
            parser[`${component}.${variant}.${canId}`] = {}
          }
          parser[`${component}.${variant}.${canId}`][e.params] = createFn(e.equation)
          return parser
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
        if (isNil(defaultParser[`${component}.${variant}.${canId}`])) {
          defaultParser[`${component}.${variant}.${canId}`] = {}
        }
        defaultParser[`${component}.${variant}.${canId}`][e.params] = createFn(e.equation)
        return defaultParser
      })
    })
  })

  return event => {
    const parsedData = []
    const {attributes, data} = event

    data.forEach(d => {
      const {
        can_id: canId,
        data: value,
        timestamp,
        seq_num: seqNum,
        bigsink_timestamp: bsTimestamp,
        bike_id: bikeId,
        global_seq: globalSeq
      } = d.canRaw

      const bytes = convertHexToBytes(value)
      const componentKeys = attributes.channel.split("/")
      if (attributes.channel === "can") {
        // here pluck the key which contains the can id
        const parserKeys = keys(defaultParser)
        const keyToCheck = parserKeys.filter(key => new RegExp(canId).test(key))
        const dataItemKeys = keys(parser[keyToCheck])
        return dataItemKeys.forEach(key => {
          parsedData.push({
            can_id: canId,
            timestamp,
            seq_num: seqNum,
            key,
            value: parser[keyToCheck][key](bytes),
            bigsink_timestamp: bsTimestamp,
            bike_id: bikeId,
            ...(globalSeq && {global_seq: globalSeq})
          })
        })
      } else {
        const keyToCheck = `${componentKeys.join(".")}.${canId}`
        const dataItemKeys = keys(parser[keyToCheck])
        // TODO: factor this out as a function
        return dataItemKeys.forEach(key => {
          parsedData.push({
            can_id: canId,
            timestamp,
            seq_num: seqNum,
            key,
            value: parser[keyToCheck][key](bytes),
            bigsink_timestamp: bsTimestamp,
            bike_id: bikeId,
            ...(globalSeq && {global_seq: globalSeq})
          })
        })
      }
    })
    return parsedData
  }
}
