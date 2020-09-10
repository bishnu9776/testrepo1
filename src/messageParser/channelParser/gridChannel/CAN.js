import {flatten} from "ramda"
import {getDataItem} from "../utils/getDataItem"

export const parseCAN = message => {
  const {data, attributes} = message
  // const updatedAttributes = {...attributes, bike_id: attributes.db_id} // TODO: Clarify on why CAN channel alone has this
  const parsedEvents = data.map(d => {
    return d.parsed.map(e => {
      const timestamp = new Date(e.timestamp * 1000).toISOString()
      return getDataItem({
        dataItemName: e.key,
        attributes,
        timestamp,
        value: e.value,
        sequence: e.seq_num,
        podId: e.pod_id
      })
    })
  })

  return flatten(parsedEvents)
}
