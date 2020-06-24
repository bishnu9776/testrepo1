import {keys} from "ramda"
import {loadFile} from "../../../../utils/loadFile"
import {populateDecoderConfig} from "../../utils/populateDecoderConfig"

const decodeTripFlag = (data, decoder) => {
  const {trip_flag: tripFlag, ...decodedData} = data

  const dataItems = keys(decoder)
  dataItems.forEach(dataItem => {
    decodedData[dataItem] = decoder[dataItem](tripFlag)
  })

  return decodedData
}

export const getRMSDecoder = () => {
  const decoderConfigPath = process.env.VI_RMS_DECODER_CONFIG_PATH
  const decoderConfig = loadFile(decoderConfigPath)
  const decoder = populateDecoderConfig(decoderConfig)

  return message => {
    const {data} = message
    return data.map(d => decodeTripFlag(d, decoder))
  }
}
