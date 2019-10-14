import {flatten} from "ramda"

export const parseSESSION = ({data, attributes, probe}) => {
  return flatten(
    data.map(event => {
      const probeInfo = probe.vehicle_status

      const {version, bike_id, channel} = attributes // eslint-disable-line
      const timestamp = new Date(event.timestamp * 1000).toISOString()
      const start_ts = new Date(parseFloat(event.start_timestamp) * 1000).toISOString() // eslint-disable-line
      const end_ts = new Date(parseFloat(event.end_timestamp) * 1000).toISOString() // eslint-disable-line
      return {
        timestamp,
        data_item_name: "vehicle_status",
        data_item_id: `vehicle_status-${version}`,
        device_uuid: bike_id,
        is_visible: event.isvisible,
        session_id: event.session_id,
        start_ts,
        end_ts,
        channel,
        sequence: event.seq_num,
        ...probeInfo
      }
    })
  ).filter(e => !!e)
}
