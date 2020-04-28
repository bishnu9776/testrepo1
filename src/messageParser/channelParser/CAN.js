import {flatten, isNil} from "ramda"
import {getDataItem} from "./helpers"
import {canDecoder} from "./channelDecoder/can-decoder"
import {log} from "../../logger"

const {env} = process

export const parseCAN = message => {
  const {data, attributes} = message

  let decodedData = []

  const shouldDecodeData = JSON.parse(env.VI_SHOULD_DECODE_CAN_DATA || "false")
  const canDecoderConfigPath =
    env.VI_CAN_DECODER_CONFIG_PATH || "../../../test/fixtures/bike-channels/can-parser-config.json"
  const versionComponentConfigPath =
    env.VI_CAN_VERSIION_COMPONENT_CONFIG_PATH || "../../../test/fixtures/bike-channels/component-version-config.json"

  // eslint-disable-next-line global-require,import/no-dynamic-require
  const canDecoderConfig = require(canDecoderConfigPath)

  // eslint-disable-next-line global-require,import/no-dynamic-require
  const defaultComponentToVersionMapping = require(versionComponentConfigPath)

  if (isNil(canDecoderConfig) || isNil(defaultComponentToVersionMapping)) {
    log.error("Required decoder configs are not present")
  }

  if (shouldDecodeData) {
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
