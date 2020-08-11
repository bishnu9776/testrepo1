import {flatten} from "ramda"
import {getDataItem} from "./utils/getDataItem"

const nonDataItemKeys = [
  "timestamp",
  "seq_num",
  "gpstime_utc",
  "global_seq",
  "bike_id",
  "data",
  "can_id",
  "start_timestamp",
  "end_timestamp",
  "timestamp",
  "key",
  "value"
]

export const parseGen2Data = ({data, attributes}) => {
  return flatten(
    data.map(event => {
      const timestamp = new Date(event.timestamp * 1000).toISOString()
      const canKey = event.key
      const canValue = event.value
      return Object.keys(event)
        .filter(dataItemName => !nonDataItemKeys.includes(dataItemName))
        .filter(dataItemName => event[dataItemName] !== null)
        .map(dataItemName => {
          return getDataItem({
            timestamp,
            attributes,
            dataItemName,
            value: event[dataItemName],
            sequence: event.seq_num
          })
        })
        .concat([getDataItem({timestamp, attributes, dataItemName: canKey, value: canValue, sequence: event.seq_num})])
        .filter(e => !!e)
    })
  )
}
