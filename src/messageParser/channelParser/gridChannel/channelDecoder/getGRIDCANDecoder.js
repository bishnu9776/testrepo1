import {flatten, isNil, keys} from "ramda"
import {isNilOrEmpty} from "../../../../utils/isNilOrEmpty"
import {loadJSONFile} from "../../../../utils/loadJSONFile"
import {convertIntCANIdToHex} from "../../bikeChannel/channelDecoder/utils/convertIntCANIdToHex"
import {convertLongToBytes} from "../../bikeChannel/channelDecoder/utils/convertLongToBytes"

// eslint-disable-next-line no-new-func
const createFn = eqn => Function("bytes", `return ${eqn}`)

const {env} = process

const decodeGRIDCANRaw = (canRaw, decoderForCANId, attributes) => {
  const {bike_id: dbId} = attributes
  const {can_id: canId, data: value, timestamp, seq_num: seqNum, global_seq: globalSeq, pod_id: podId} = canRaw
  const numberOfBytes = parseInt(env.VI_GRID_CAN_MESSAGE_BYTE_LENGTH, 10)
  const bytes = convertLongToBytes(value, numberOfBytes)
  const dataItems = keys(decoderForCANId)

  const decodedDataItems = dataItems.map(dataItem => {
    if (decoderForCANId[dataItem].condition && !decoderForCANId[dataItem].condition(bytes)) {
      return null
    }

    return {
      can_id: canId,
      timestamp,
      seq_num: seqNum,
      key: dataItem,
      value: decoderForCANId[dataItem].eqn(bytes),
      db_id: dbId,
      pod_id: podId,
      ...(globalSeq && {global_seq: globalSeq})
    }
  })

  return decodedDataItems.filter(e => !!e)
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
          decoder[`${component}.${version}.${canId}`][e.params] = {
            eqn: createFn(e.equation),
            ...(e.condition && {condition: createFn(e.condition)})
          }
        })
      })
    })
  })

  return decoder
}

export const getGRIDCANDecoder = metricRegistry => {
  const decoderConfigPath = env.VI_GRID_CAN_DECODER_CONFIG_PATH
  const decoderConfig = loadJSONFile(decoderConfigPath)
  const decoder = populateDecoderConfig(decoderConfig)

  return message => {
    const {data, attributes} = message

    return flatten(
      data.map(d => {
        const {can_id: canId} = d

        const decoderKeys = keys(decoder)
        const hexCanId = convertIntCANIdToHex(canId)
        const decoderKey = decoderKeys.filter(key => new RegExp(hexCanId).test(key))

        if (decoderKey.length !== 1) {
          metricRegistry.updateStat("Counter", "grid_can_messages_ignored", 1, {
            channel: attributes.channel,
            can_id: hexCanId
          })
          return []
        }

        return decodeGRIDCANRaw(d, decoder[decoderKey[0]], attributes)
      })
    )
  }
}
