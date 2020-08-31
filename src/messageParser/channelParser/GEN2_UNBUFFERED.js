import {flatten} from "ramda"

export const parseGen2UnbufferedData = ({message}) => {
  const {data, attributes} = message
  return flatten(
    data.map(event => {
      const {version, bike_id: bikeId, channel} = attributes
      const timestamp = event.end_timestamp ? event.end_timestamp : event.start_timestamp
      const {seq_num: sequence, isvalid} = event
      const dataItemName = "error_code"
      const dataItemId = JSON.parse(process.env.USE_BIKE_ID_AS_DATA_ITEM_ID_PREFIX || "false")
        ? `${bikeId}-${dataItemName}`
        : `${dataItemName}-${version}`
      return {
        timestamp: new Date(parseFloat(timestamp) * 1000).toISOString(),
        data_item_name: dataItemName,
        data_item_id: dataItemId,
        device_uuid: bikeId,
        native_code: event.error_code,
        condition_level: event.end_timestamp ? "NORMAL" : "FAULT",
        ...(isvalid && {is_valid: isvalid}),
        ...(sequence && {sequence}),
        channel
      }
    })
  )
}
