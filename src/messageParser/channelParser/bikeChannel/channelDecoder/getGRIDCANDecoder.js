import {keys, isNil} from "ramda"
import {isNilOrEmpty} from "../../../../utils/isNilOrEmpty"
import {loadJSONFile} from "../../../../utils/loadJSONFile"
import {convertHexToBytes} from "./utils/convertHexToBytes"

// eslint-disable-next-line no-new-func
const createFn = eqn => Function("bytes", `return ${eqn}`)

const {env} = process

const decodeGRIDCANRaw = (canRaw, decoderForCANId) => {
  const {
    can_id: canId,
    data: value,
    timestamp,
    seq_num: seqNum,
    db_id: dbId,
    global_seq: globalSeq,
    pod_id: podId
  } = canRaw
  const numberOfBytes = parseInt(env.VI_CAN_MESSAGE_BYTE_LENGTH || "16", 10)
  const bytes = convertHexToBytes(value, numberOfBytes)
  const dataItems = keys(decoderForCANId)

  const decodedDataItems = dataItems.map(dataItem => {
    if (decoderForCANId[dataItem].condition && !decoderForCANId[dataItem].condition(bytes)) {
      return {}
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

  return decodedDataItems.filter(e => !isNilOrEmpty(e))
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

export const getGRIDCANDecoder = () => {
  const decoderConfigPath = env.VI_CAN_DECODER_CONFIG_PATH
  const decoderConfig = loadJSONFile(decoderConfigPath)
  const decoder = populateDecoderConfig(decoderConfig)

  return message => {
    const {data} = message

    return data.map(d => {
      const {can_id: canId} = d.canRaw

      const decoderKeys = keys(decoder)
      let decodeKey = decoderKeys.filter(key => new RegExp(canId).test(key))
      decodeKey = decoder[decodeKey]

      return decodeGRIDCANRaw(d.canRaw, decodeKey)
    })
  }
}
