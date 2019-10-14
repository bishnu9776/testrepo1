import {flatten} from "ramda"

export const parseHEMAN = ({data, attributes}) => {
  return flatten(
    data.map(event => {
      // eslint-disable-next-line
      const {version, bike_id, channel} = attributes
      const timestamp = new Date(event.timestamp * 1000).toISOString()
      return {
        timestamp,
        data_item_name: "heman",
        data_item_id: `heman-${version}`,
        device_uuid: bike_id,
        value_event: event.error_code,
        is_valid: event.isvalid,
        channel,
        sequence: event.seq_num
      }
    })
  ).filter(e => !!e)
}
