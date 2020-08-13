import {flatten} from "ramda"
import {getDataItem} from "./utils/getDataItem"
import {getValues} from "./utils/getValues"

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

export const parseGen2Data = ({message, probe, log}) => {
  // Data items w/o direct mapping in the data
  const syntheticDataItemNameList = Object.values(probe)
    .filter(dataItemProbe => dataItemProbe.synthetic)
    .map(dataItemProbe => dataItemProbe.data_item_name)

  const {data, attributes} = message
  return flatten(
    data.map(event => {
      const timestamp = new Date(event.timestamp * 1000).toISOString()
      const {key, value} = event // maybe special case for can channel
      const embellishedEvent = {...event, [key]: value}
      return [...Object.keys(embellishedEvent), ...syntheticDataItemNameList]
        .filter(dataItemName => !nonDataItemKeys.includes(dataItemName))
        .filter(dataItemName => embellishedEvent[dataItemName] !== null)
        .map(dataItemName => {
          return getDataItem({
            timestamp,
            attributes,
            dataItemName,
            value: getValues({event: embellishedEvent, dataItemName, probe, log}),
            sequence: event.seq_num
          })
        })
        .filter(e => !!e)
    })
  )
}
