import {flatten} from "ramda"
import {nonDataItemKeys} from "../../../constants"
import {getDataItem} from "./getDataItem"

// TODO: Better name for this based on the shape this function handles
export const parseMessage = (message, attributes) => {
  return flatten(
    message.map(event => {
      const timestamp = new Date(event.timestamp * 1000).toISOString()
      return Object.keys(event)
        .filter(dataItemName => !nonDataItemKeys.includes(dataItemName))
        .map(dataItemName => {
          return getDataItem({
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
