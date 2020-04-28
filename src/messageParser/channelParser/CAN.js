import {flatten} from "ramda"
import {getDataItem} from "./helpers"
import {canDecoder} from "./channelDecoder/can-decoder"
import {loadDecoderConfig} from "../../utils/loadDecoderConfig"

const {env} = process

export const parseCAN = message => {
  const {data, attributes} = message

  let decodedData = []

  const shouldDecodeData = JSON.parse(env.VI_SHOULD_DECODE_CAN_DATA || "false")

  if (shouldDecodeData) {
    const canDecoderConfigPath = env.VI_CAN_DECODER_CONFIG_PATH
    const componentVersionConfigPath = env.VI_CAN_COMPONENT_VERSION_CONFIG_PATH

    const canDecoderConfig = loadDecoderConfig(canDecoderConfigPath)
    const defaultComponentToVersionMapping = loadDecoderConfig(componentVersionConfigPath)

    decodedData = flatten(canDecoder(canDecoderConfig, defaultComponentToVersionMapping)(message))
  } else {
    decodedData = flatten(data.map(e => e.parsed))
  }

  return decodedData.map(e => {
    const timestamp = new Date(e.timestamp * 1000).toISOString()
    return getDataItem({
      dataItemName: e.key,
      attributes,
      timestamp,
      value: e.value,
      sequence: e.seq_num,
      bigSinkTimestamp: `${e.bigsink_timestamp}Z`
    })
  })
}
