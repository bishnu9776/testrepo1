import {flatten} from "ramda"
import {nonDataItemKeys} from "../../constants"
import {getDataItem} from "./helpers"

export const parseIMU = ({data, attributes}) => {
  return flatten(
    data.map(event => {
      const timestamp = new Date(event.timestamp * 1000).toISOString()
      return Object.keys(event)
        .filter(dataItemName => !nonDataItemKeys.includes(dataItemName))
        .map(dataItemName => {
          return getDataItem({
            timestamp,
            attributes,
            dataItemName,
            value: event[dataItemName],
            sequence: event.seq_num,
            bigSinkTimestamp: `${event.bigsink_timestamp}Z`
          })
        })
        .filter(e => !!e)
    })
  )
}
