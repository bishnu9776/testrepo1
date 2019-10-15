import {flatten} from "ramda"
import {getDataItem} from "./helpers"
import {nonDataItemKeys} from "../../constants"

export const parseVCU = ({data, attributes}) => {
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
            bigsink_timestamp: `${event.bigsink_timestamp}Z`
          })
        })
        .filter(e => !!e)
    })
  )
}
