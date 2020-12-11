import {keys, isNil, head} from "ramda"
import {log} from "../../../../logger"
import {isNilOrEmpty} from "../../../../utils/isNilOrEmpty"
import {loadJSONFile} from "../../../../utils/loadJSONFile"
import {convertLongToBytes} from "./utils/convertLongToBytes"
import {convertIntCANIdToHex} from "./utils/convertIntCANIdToHex"
// eslint-disable-next-line no-new-func
const createFn = eqn => Function("bytes", `return ${eqn}`)

const {env} = process

const decodeCANRaw = (canRaw, decoderForCANId) => {
  const {can_id: canId, data: value, timestamp, seq_num: seqNum, bike_id: bikeId, global_seq: globalSeq} = canRaw
  const bytes = convertLongToBytes(value)
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
        const decimalCanId = parseInt(canId, 16)
        config[component][version][canId].forEach(e => {
          if (isNil(decoder[`${component}.${version}.${decimalCanId}`])) {
            decoder[`${component}.${version}.${decimalCanId}`] = {}
          }
          decoder[`${component}.${version}.${decimalCanId}`][e.params] = createFn(e.equation)
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
        const decimalCanId = parseInt(canId, 16)
        config[component][version][canId].forEach(e => {
          if (isNil(legacyDecoder[device][`${component}.${version}.${decimalCanId}`])) {
            legacyDecoder[device][`${component}.${version}.${decimalCanId}`] = {}
          }
          legacyDecoder[device][`${component}.${version}.${decimalCanId}`][e.params] = createFn(e.equation)
        })
      })
    })
  })
  return legacyDecoder
}

export const getCANDecoder = metricRegistry => {
  const decoderConfigPath = env.VI_CAN_DECODER_CONFIG_PATH
  const legacyComponentVersionConfigPath = env.VI_CAN_LEGACY_COMPONENT_VERSION_CONFIG_PATH
  const decoderConfig = loadJSONFile(decoderConfigPath)
  const legacyComponentVersionConfig = loadJSONFile(legacyComponentVersionConfigPath)

  const decoder = populateDecoderConfig(decoderConfig)
  const legacyDecoder = populateLegacyDecoderConfig(decoderConfig, legacyComponentVersionConfig)
  const isLegacy = channel => channel === "can_raw"

  return message => {
    const {attributes, data} = message
    const device = attributes.device_id

    return data.map(d => {
      const {can_id: canId} = d
      const componentKeys = attributes.channel.split("/")

      if (isLegacy(attributes.channel)) {
        const decoderForDevice = legacyDecoder[device] || legacyDecoder.DEFAULT
        const decoderKeys = keys(decoderForDevice)
        const decoderKeyForCANId = decoderKeys.filter(key => new RegExp(canId).test(key))
        if (decoderKeyForCANId.length !== 1) {
          log.error(
            {ctx: {event: JSON.stringify(message, null, 2), keyToCheck: `${attributes.channel}${canId}`}},
            "Event does not map to one decoder for its CAN id"
          )
          metricRegistry.updateStat("Counter", "can_legacy_message_ignored", 1, {
            channel: attributes.channel,
            can_id: convertIntCANIdToHex(canId)
          })
          return []
        }
        const decoderForCANId = decoderForDevice[head(decoderKeyForCANId)]
        return decodeCANRaw(d, decoderForCANId)
      }
      const decoderKey = `${componentKeys.join(".")}.${canId}`
      const decoderForCANId = decoder[decoderKey]
      if (isNilOrEmpty(decoderForCANId)) {
        log.debug(
          {ctx: {event: JSON.stringify(message, null, 2), keyToCheck: decoderForCANId}},
          "Event does not map to a decoder for its CAN id"
        )
        metricRegistry.updateStat("Counter", "can_message_ignored", 1, {
          channel: attributes.channel,
          can_id: convertIntCANIdToHex(canId)
        })
        return []
      }
      return decodeCANRaw(d, decoderForCANId)
    })
  }
}
