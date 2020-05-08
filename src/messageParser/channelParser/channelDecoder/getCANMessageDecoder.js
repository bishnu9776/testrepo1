import {keys, isNil, head} from "ramda"
import {log} from "../../../logger"
import {isNilOrEmpty} from "../../../utils/isNilOrEmpty"
import {loadJSONFile} from "../../../utils/loadJSONFile"

// eslint-disable-next-line no-new-func
const createFn = eqn => Function("bytes", `return ${eqn}`)

const {env} = process

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

const decodeCANRaw = (canRaw, decoderForCANId) => {
  const {can_id: canId, data: value, timestamp, seq_num: seqNum, bike_id: bikeId, global_seq: globalSeq} = canRaw

  const bytes = convertHexToBytes(value)
  const dataItems = keys(decoderForCANId)

  return dataItems.map(dataItem => ({
    can_id: canId,
    timestamp,
    seq_num: seqNum,
    key: dataItem,
    value: decoderForCANId[dataItem](bytes),
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

const populateLegacyDecoderConfig = (config, defaultComponentToVersionMapping) => {
  const legacyDecoder = {}
  const devices = keys(defaultComponentToVersionMapping)

  if (isNilOrEmpty(devices) || isNilOrEmpty(config)) {
    return legacyDecoder
  }

  devices.forEach(device => {
    legacyDecoder[device] = {}
    const components = keys(defaultComponentToVersionMapping[device])
    components.forEach(component => {
      const version = defaultComponentToVersionMapping[device][component]
      const canIds = keys(config[component][version])
      canIds.forEach(canId => {
        config[component][version][canId].forEach(e => {
          if (isNil(legacyDecoder[device][`${component}.${version}.${canId}`])) {
            legacyDecoder[device][`${component}.${version}.${canId}`] = {}
          }
          legacyDecoder[device][`${component}.${version}.${canId}`][e.params] = createFn(e.equation)
        })
      })
    })
  })
  return legacyDecoder
}

export const getCANMessageDecoder = () => {
  const decoderConfigPath = env.VI_CAN_DECODER_CONFIG_PATH
  const legacyComponentVersionConfigPath = env.VI_CAN_LEGACY_COMPONENT_VERSION_CONFIG_PATH
  const decoderConfig = loadJSONFile(decoderConfigPath)
  const legacyComponentVersionConfig = loadJSONFile(legacyComponentVersionConfigPath)

  const decoder = populateDecoderConfig(decoderConfig)
  const legacyDecoder = populateLegacyDecoderConfig(decoderConfig, legacyComponentVersionConfig)
  const isLegacy = channel => channel === "can"

  return message => {
    const {attributes, data} = message
    const device = attributes.bike_id

    return data.map(d => {
      const {can_id: canId} = d.canRaw
      const componentKeys = attributes.channel.split("/")

      if (isLegacy(attributes.channel)) {
        const decoderForDevice = legacyDecoder[device] || legacyDecoder.DEFAULT
        const decoderKeys = keys(decoderForDevice)
        const decoderKeyForCANId = decoderKeys.filter(key => new RegExp(canId).test(key))
        if (decoderKeyForCANId.length !== 1) {
          log.error(
            {ctx: {event: JSON.stringify(message, null, 2), keyToCheck: decoderKeyForCANId}},
            "Event does not map to one decoder for its CAN id"
          )
          return []
        }
        const decoderForCANId = decoderForDevice[head(decoderKeyForCANId)]
        return decodeCANRaw(d.canRaw, decoderForCANId)
      }
      const decoderKey = `${componentKeys.join(".")}.${canId}`
      const decoderForCANId = decoder[decoderKey]
      return decodeCANRaw(d.canRaw, decoderForCANId)
    })
  }
}
