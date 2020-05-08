import {flatten} from "ramda"
import {getDataItem} from "./helpers"

export const parseSOH2 = ({data, attributes}) => {
  return flatten(
    data.map(e => {
      const timestamp = new Date(e.timestamp * 1000).toISOString()
      return getDataItem({
        dataItemName: e.key,
        attributes,
        timestamp,
        value: e.value,
        sequence: e.seq_num
      })
    })
  ).filter(e => !!e)
}
