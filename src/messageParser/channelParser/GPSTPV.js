import {flatten} from "ramda"
import {getDataItem} from "./helpers"

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
      const bikeId = attributes.bike_id
      const timestamp = new Date(event.timestamp * 1000).toISOString()

      const locationEvent = {
        value: {lat: event.lat_deg || null, lon: event.lon_deg || null},
        data_item_name: "location",
        data_item_type: "LOCATION",
        data_item_id: `location-${attributes.version}`,
        timestamp,
        device_uuid: bikeId,
        sequence: event.seq_num,
        mode: event.mode,
        bigsink_timestamp: `${event.bigsink_timestamp}Z`,
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
            sequence: event.seq_num,
            bigSinkTimestamp: `${event.bigsink_timestamp}Z`
          })
        })
        .filter(e => !!e)

      return [locationEvent, ...eventAndSampleDataItems]
    })
  )
}
