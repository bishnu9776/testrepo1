import {flatten} from "ramda"
import {getDataItem} from "../utils/getDataItem"
import {getCANDecoder} from "./channelDecoder/getCANDecoder"
import {parseCANRAW} from "./CAN_RAW"

export const parseCAN = metricRegistry => {
  const decodeCANMessage = getCANDecoder(metricRegistry)

  return message => {
    let decodedMessage = []
    const {data, attributes} = message
    decodedMessage = flatten(decodeCANMessage(message))

    const parsedMessage = decodedMessage.map(e => {
      const timestamp = new Date(e.timestamp * 1000).toISOString()
      return getDataItem({
        dataItemName: e.key,
        attributes,
        timestamp,
        value: e.value,
        sequence: e.seq_num,
        canId: e.can_id
      })
    })

    return parsedMessage.concat(parseCANRAW({data, attributes}))
  }
}
