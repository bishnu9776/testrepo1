import {flatten} from "ramda"

export const parseGen2UnbufferedData = ({message}) => {
  const {data, attributes} = message
  return flatten(
    data.map(event => {
      const {device_id: deviceId, channel} = attributes
      const timestamp = event.end_timestamp ? event.end_timestamp : event.start_timestamp
      const {seq_num: sequence, isvalid} = event
      const dataItemName = "error_code"
      return {
        timestamp: new Date(parseFloat(timestamp) * 1000).toISOString(),
        data_item_name: dataItemName,
        device_uuid: deviceId,
        native_code: event.error_code,
        condition_level: event.end_timestamp ? "NORMAL" : "FAULT",
        ...(isvalid && {is_valid: isvalid}),
        ...(sequence && {sequence}),
        channel
      }
    })
  )
}
