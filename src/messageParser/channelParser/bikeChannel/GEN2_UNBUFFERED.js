import {flatten} from "ramda"
import {getDataItemId} from "../../../utils/helpers"

export const parseGen2UnbufferedData = ({message}) => {
  const {data, attributes} = message
  return flatten(
    data.map(event => {
      const {bike_id: bikeId, channel} = attributes
      const timestamp = event.end_timestamp ? event.end_timestamp : event.start_timestamp
      const {seq_num: sequence, isvalid} = event
      const dataItemName = "error_code"
      return {
        timestamp: new Date(parseFloat(timestamp) * 1000).toISOString(),
        data_item_name: dataItemName,
        data_item_id: getDataItemId({dataItemName, deviceId: bikeId}),
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
