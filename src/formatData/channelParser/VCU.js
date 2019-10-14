import {flatten} from "ramda"
import {getDataItem} from "./helpers"

// TODO: Blacklist or whitelist?
const nonDataItemKeys = ["timestamp", "seq_num", "gpstime_utc", "global_seq", "bigsink_timestamp", "bike_id", "data"]

export const parseVCU = ({data, attributes, probe}) => {
  return flatten(
    data.map(event => {
      const timestamp = new Date(event.timestamp * 1000).toISOString()
      return Object.keys(event)
        .filter(dataItemName => !nonDataItemKeys.includes(dataItemName))
        .map(dataItemName => {
          return getDataItem({
            probe,
            timestamp,
            attributes,
            dataItemName,
            value: event[dataItemName],
            sequence: event.seq_num
          })
        })
        .filter(e => !!e)
    })
  )
}
