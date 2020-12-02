import {flatten} from "ramda"

export const parseCANRAW = ({data, attributes}) => {
  return flatten(
    data.map(e => {
      const timestamp = new Date(e.timestamp * 1000).toISOString()
      return {
        data_item_name: "can_raw",
        value: {...e},
        attributes,
        channel: attributes.channel,
        device_uuid: attributes.device_id,
        timestamp
      }
    })
  )
}
