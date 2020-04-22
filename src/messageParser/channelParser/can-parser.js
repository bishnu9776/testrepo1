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
  const coomponents = keys(config)
  coomponents.forEach(component => {
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

  return event => {
    const parsedData = []
    const {attributes, data} = event

    if (attributes.channel === "can") {
      // use default config
    } else {
      const componentKeys = attributes.channel.split("/")

      data.map(d => {
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

        const keyToCheck = `${componentKeys.join(".")}.${canId}`
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
      })
    }
    return parsedData
  }
}
