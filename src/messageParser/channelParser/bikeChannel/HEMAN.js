import {flatten} from "ramda"

export const parseHEMAN = ({data, attributes}) => {
  return flatten(
    data.map(event => {
      // eslint-disable-next-line
      const {version, device_id: deviceId, channel} = attributes
      const timestamp = event.end_timestamp ? event.end_timestamp : event.start_timestamp
      return {
        timestamp: new Date(parseFloat(timestamp) * 1000).toISOString(),
        data_item_name: "error_code",
        device_uuid: deviceId,
        native_code: event.error_code,
        condition_level: event.end_timestamp ? "NORMAL" : "FAULT",
        is_valid: event.isvalid,
        channel,
        sequence: event.seq_num
      }
    })
  ).filter(e => !!e)
}
