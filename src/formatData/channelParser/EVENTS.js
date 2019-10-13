import {flatten} from "ramda"
import {getDataItem} from "./helpers"

export const parseEVENTS = ({data, attributes, probe}) => {
  return flatten(
    data.map(e => {
      const timestamp = new Date(e.timestamp * 1000).toISOString()
      return getDataItem({probe, dataItemName: e.key, attributes, timestamp, value: e.value})
    })
  ).filter(e => !!e)
}
