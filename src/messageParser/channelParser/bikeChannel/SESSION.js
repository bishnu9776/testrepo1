import {flatten} from "ramda"
import {getDataItemId} from "../../../utils/helpers"

export const parseSESSION = ({data, attributes}) => {
  return flatten(
    data.map(event => {
      const {version, bike_id, channel} = attributes // eslint-disable-line
      const timestamp = new Date(event.timestamp * 1000).toISOString()

      const start_ts = event.start_timestamp ? new Date(parseFloat(event.start_timestamp) * 1000).toISOString() : null// eslint-disable-line
      const end_ts = event.end_timestamp ? new Date(parseFloat(event.end_timestamp) * 1000).toISOString() : null // eslint-disable-line
      return {
        timestamp,
        data_item_name: "vehicle_status",
        data_item_id: getDataItemId({dataItemName: "vehicle_status", deviceId: bike_id}),
        device_uuid: bike_id,
        is_visible: event.isvisible,
        session_id: event.session_id,
        start_ts,
        end_ts,
        channel,
        sequence: event.seq_num
      }
    })
  ).filter(e => !!e)
}
