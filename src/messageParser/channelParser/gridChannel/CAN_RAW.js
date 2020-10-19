import {flatten} from "ramda"
import {getDataItem} from "../utils/getDataItem"
import {getGRIDCANDecoder} from "./channelDecoder/getGRIDCANDecoder"

export const parseGridCANRaw = metricRegistry => {
  const decodeGridCANMessage = getGRIDCANDecoder(metricRegistry)

  return message => {
    const decodedMessage = flatten(decodeGridCANMessage(message))

    return decodedMessage.map(e => {
      const timestamp = new Date(e.timestamp * 1000).toISOString()
      return getDataItem({
        dataItemName: e.key,
        attributes: message.attributes,
        timestamp,
        value: e.value,
        sequence: e.seq_num,
        canId: e.can_id
      })
    })
  }
}
