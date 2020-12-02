import {flatten} from "ramda"
import {getDataItem} from "../utils/getDataItem"
import {getDataItemId} from "../../../utils/helpers"

const eventAndSampleKeys = [
  "mode",
  "ept_s",
  "epx_m",
  "epy_m",
  "epv_m",
  "epd_deg",
  "eps_mps2",
  "epc_mps2",
  "track_deg",
  "speed_mps",
  "climb_mps",
  "alt_m",
  "ttff_s",
  "lat_deg",
  "lon_deg"
]

export const parseGPSTPV = ({data, attributes}) => {
  return flatten(
    data.map(event => {
      const deviceId = attributes.device_id
      const timestamp = new Date(event.timestamp * 1000).toISOString()

      const locationEvent = {
        value: {lat: event.lat_deg || null, lon: event.lon_deg || null},
        data_item_name: "location",
        data_item_type: "LOCATION",
        data_item_id: getDataItemId({dataItemName: "location", deviceId}),
        timestamp,
        device_uuid: deviceId,
        sequence: event.seq_num,
        mode: event.mode,
        channel: attributes.channel
      }

      const eventAndSampleDataItems = Object.keys(event)
        .filter(dataItemName => eventAndSampleKeys.includes(dataItemName))
        .map(dataItemName => {
          return getDataItem({
            timestamp,
            attributes,
            dataItemName,
            value: event[dataItemName],
            sequence: event.seq_num
          })
        })
        .filter(e => !!e)

      return [locationEvent, ...eventAndSampleDataItems]
    })
  )
}
