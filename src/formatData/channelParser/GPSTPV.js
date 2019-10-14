import {difference, flatten, mergeDeepLeft, pick} from "ramda"
import {getDataItem} from "./helpers"

const locationKeys = ["lat_deg", "lon_deg"]

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
  "ttff_s"
]

// TODO: Handle missing location
export const parseGPSTPV = ({data, attributes}) => {
  return flatten(
    data.map(event => {
      const bikeId = attributes.bike_id
      const timestamp = new Date(event.timestamp * 1000).toISOString()

      const locationEvent = mergeDeepLeft(
        {value_location: pick(locationKeys, event)},
        {
          value_location: {
            lat_deg: null,
            lon_deg: null
          },
          data_item_name: "location",
          data_item_type: "LOCATION",
          data_item_id: `location-${attributes.version}`,
          timestamp,
          device_uuid: bikeId,
          sequence: event.seq_num
        }
      )

      const missingKeys = difference(eventAndSampleKeys, Object.keys(event))

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

      const missingKeyEvents = missingKeys.map(dataItemName => {
        return getDataItem({timestamp, attributes, dataItemName, value: null, sequence: event.seq_num})
      })

      return [locationEvent, ...eventAndSampleDataItems, ...missingKeyEvents]
    })
  )
}
