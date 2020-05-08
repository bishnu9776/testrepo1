import {keys} from "ramda"
import path from "path"
import {convertHexToBytes} from "./utils/convertHexToBytes"
import {errorFormatter} from "../../../utils/errorFormatter"

const loadFile = (filePath, log) => {
  try {
    return require(path.resolve(filePath)) // eslint-disable-line global-require, import/no-dynamic-require
  } catch (e) {
    log.error({error: errorFormatter(e)}, "Could not load config file.")
  }
}

// eslint-disable-next-line no-new-func
const createFn = eqn => Function("bytes", `return ${eqn}`)

const decodeMCU = (data, decoder) => {
  const {seq_num: seqNum, timestamp, data: value} = data
  const decodedData = {
    seq_num: seqNum,
    timestamp
  }
  const numberOfBytes = 104
  const bytes = convertHexToBytes(value, numberOfBytes)
  const dataItems = keys(decoder)
  dataItems.forEach(dataItem => {
    decodedData[dataItem] = decoder[dataItem](bytes)
  })
  return decodedData
}

const populateDecoderConfig = config => {
  const decoder = {}
  config.forEach(e => {
    decoder[e.name] = createFn(e.decode)
  })
  return decoder
}

export const getMCUDecoder = () => {
  const decoderConfigPath = process.env.VI_MCU_DECODER_CONFIG_PATH
  const decoderConfig = loadFile(decoderConfigPath).mcuConfig
  const decoder = populateDecoderConfig(decoderConfig)
  return message => {
    const {data} = message
    return data.map(d => decodeMCU(d, decoder))
  }
}
