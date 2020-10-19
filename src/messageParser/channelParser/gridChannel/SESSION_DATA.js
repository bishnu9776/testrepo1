import {difference, flatten, pick} from "ramda"
import {getDataItem} from "../utils/getDataItem"

const keysToIgnore = ["timestamp", "seq_num", "global_seq", "db_id"]

export const parseSESSIONDATA = ({data, attributes}) => {
  return flatten([data]).map(e => {
    const timestamp = new Date(e.timestamp * 1000).toISOString()
    const dataItem = getDataItem({attributes, timestamp, dataItemName: "session", sequence: e.seq_num, value: null})
    const sessionInfo = pick(difference(Object.keys(e), keysToIgnore))(e)

    return {
      ...dataItem,
      ...sessionInfo
    }
  })
}
