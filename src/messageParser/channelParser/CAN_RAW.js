import {flatten} from "ramda"

export const parseCANRAW = ({data, attributes}) => {
  return flatten(
    data.map(e => {
      const timestamp = new Date(e.timestamp * 1000).toISOString()
      return {
        data_item_name: "can_raw",
        data: e,
        attributes,
        device_uuid: attributes.bike_id,
        timestamp
      }
    })
  )
}
