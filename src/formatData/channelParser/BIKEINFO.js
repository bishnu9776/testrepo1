import {omit} from "ramda"

const keysToOmit = ["timestamp", "bike_id", "seq_num", "bigsink_timestamp", "global_seq"]
export const parseBIKEINFO = ({data, attributes}) => {
  return data.map(event => {
    const {version, bike_id, channel} = attributes // eslint-disable-line

    const timestamp = new Date(event.timestamp * 1000).toISOString()
    return {
      ...omit(keysToOmit, event),
      timestamp,
      data_item_name: "bike_info",
      data_item_id: `bike_info-${version}`,
      device_uuid: bike_id,
      value: null,
      channel
      // TODO: What's the data item name for this?
      // TODO: Merge probe info?
    }
  })
}
