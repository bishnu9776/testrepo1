import {loadFile} from "../../../utils/loadFile"
import {populateDecoderConfig} from "./utils/populateDecoderConfig"
import {decodeMessage} from "./utils/decodeMessage"

export const getMCUDecoder = () => {
  const decoderConfigPath = process.env.VI_MCU_DECODER_CONFIG_PATH
  const decoderConfig = loadFile(decoderConfigPath).mcuConfig || []
  const decoder = populateDecoderConfig(decoderConfig)
  const numberOfBytes = parseInt(process.env.VI_MCU_MESSAGE_BYTE_LENGTH || "104", 10)

  return message => {
    const {data} = message
    return data.map(d => decodeMessage(d, decoder, numberOfBytes))
  }
}
