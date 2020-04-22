import {keys, isNil} from "ramda"
/**
 * should get the pasrer json
 * create configObj with function
 * create defaultConfig for legacy
 */

const parserConfig = {}

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

export const canParser = parser => {
  const componentNames = keys(parser)
  componentNames.forEach(name => {
    const variants = keys(parser[name])
    variants.forEach(variant => {
      const codes = keys(parser[name][variant])
      codes.forEach(code => {
        parser[name][variant][code].forEach(e => {
          if (isNil(parserConfig[`${name}.${variant}.${code}`])) {
            parserConfig[`${name}.${variant}.${code}`] = {}
          }
          parserConfig[`${name}.${variant}.${code}`][e.params] = createFn(e.equation)
          return parserConfig
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
        const dataItemKeys = keys(parserConfig[keyToCheck])
        return dataItemKeys.forEach(key => {
          parsedData.push({
            can_id: canId,
            timestamp,
            seq_num: seqNum,
            key,
            value: parserConfig[keyToCheck][key](bytes),
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
