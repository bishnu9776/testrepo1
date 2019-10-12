import {difference, flatten, mergeDeepLeft, pick} from "ramda"
import {getDataItem} from "./helpers"

const eventOrSampleKeys = [
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

const locationKeys = ["lat_deg", "lon_deg"]

// TODO: Handle missing location
export const parseGPSTPV = ({data, attributes, probe}) => {
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
          ...probe.lat_deg,
          data_item_name: "location",
          data_item_type: "LOCATION",
          data_item_id: `location-${attributes.version}`,
          timestamp,
          id: `${bikeId}-location-${timestamp}`
        }
      )

      const missingKeys = difference(eventOrSampleKeys, Object.keys(event))

      const eventAndSampleDataItems = Object.keys(event)
        .filter(dataItemName => eventOrSampleKeys.includes(dataItemName))
        .map(dataItemName => {
          return getDataItem({probe, timestamp, attributes, dataItemName, value: event[dataItemName]})
        })
        .filter(e => !!e)

      const missingKeyEvents = missingKeys.map(dataItemName => {
        return getDataItem({probe, timestamp, attributes, dataItemName, value: null})
      })

      return [locationEvent, ...eventAndSampleDataItems, ...missingKeyEvents]
    })
  )
}
