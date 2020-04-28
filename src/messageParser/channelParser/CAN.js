import {flatten} from "ramda"
import {getDataItem} from "./helpers"
import {decodeCANMessage} from "./channelDecoder/decodeCANMessage"
import {loadJSONFile} from "../../utils/loadJSONFile"

const {env} = process

export const parseCAN = () => {
  let decodedData = []
  const shouldDecodeMessage = JSON.parse(env.VI_SHOULD_DECODE_CAN_MESSAGE || "false")
  const canDecoderConfigPath = env.VI_CAN_DECODER_CONFIG_PATH
  const componentVersionConfigPath = env.VI_CAN_COMPONENT_VERSION_CONFIG_PATH
  const canDecoderConfig = loadJSONFile(canDecoderConfigPath)
  const legacyComponentVersionMapping = loadJSONFile(componentVersionConfigPath)
  const getDecodeCanMessage = decodeCANMessage(canDecoderConfig, legacyComponentVersionMapping)

  return message => {
    const {data, attributes} = message
    if (shouldDecodeMessage) {
      decodedData = flatten(getDecodeCanMessage(message))
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
}
