import {loadFile} from "../../../utils/loadFile"
import {populateDecoderConfig} from "./utils/populateDecoderConfig"
import {decodeMessage} from "./utils/decodeMessage"

export const getVCUDecoder = () => {
  const decoderConfigPath = process.env.VI_VCU_DECODER_CONFIG_PATH
  const decoderConfig = loadFile(decoderConfigPath).vcuConfig
  const decoder = populateDecoderConfig(decoderConfig)
  const numberOfBytes = 268

  return message => {
    const {data} = message
    return data.map(d => decodeMessage(d, decoder, numberOfBytes))
  }
}
