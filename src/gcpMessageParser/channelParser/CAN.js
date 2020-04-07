import {flatten} from "ramda"
import {getDataItem} from "./helpers"

export const parseCAN = ({data, attributes}) => {
  return flatten(
    data.map(event => {
      return event.parsed.map(e => {
        const timestamp = new Date(e.timestamp * 1000).toISOString()
        return getDataItem({
          dataItemName: e.key,
          attributes,
          timestamp,
          value: e.value,
          sequence: e.seq_num,
          bigSinkTimestamp: `${e.bigsink_timestamp}Z`
        })
      })
    })
  ).filter(e => !!e)
}
