import {flatten} from "ramda"

export const parseGen2UnbufferedData = ({message}) => {
  const {data, attributes} = message
  return flatten(
    data.map(event => {
      // eslint-disable-next-line
      const {version, bike_id, channel} = attributes
      const timestamp = event.end_timestamp ? event.end_timestamp : event.start_timestamp
      // eslint-disable-next-line
      const is_valid = event.isvalid
      const sequence = event.seq_num
      // eslint-disable-next-line
      const bikeId = bike_id
      const dataItemName = "error_code"
      return {
        timestamp: new Date(parseFloat(timestamp) * 1000).toISOString(),
        data_item_name: dataItemName,
        data_item_id: `${bikeId}-${dataItemName}`,
        device_uuid: bikeId,
        native_code: event.error_code,
        condition_level: event.end_timestamp ? "NORMAL" : "FAULT",
        // eslint-disable-next-line
        ...(is_valid && {is_valid}),
        ...(sequence && {sequence}),
        channel
      }
    })
  )
}
