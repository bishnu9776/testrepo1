import {keys} from "ramda"
import {convertHexToBytes} from "./convertHexToBytes"

export const decodeMessage = (data, decoder, numberOfBytes) => {
  const {seq_num: seqNum, timestamp, data: value} = data
  const decodedData = {
    seq_num: seqNum,
    timestamp
  }
  const bytes = convertHexToBytes(value, numberOfBytes)
  const dataItems = keys(decoder)
  dataItems.forEach(dataItem => {
    decodedData[dataItem] = decoder[dataItem](bytes)
  })
  return decodedData
}
