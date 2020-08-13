import {flatten} from "ramda"
import {getDataItem} from "./utils/getDataItem"

const nonDataItemKeys = [
  "timestamp",
  "seq_num",
  "gpstime_utc",
  "global_seq",
  "bike_id",
  "data",
  "can_id",
  "start_timestamp",
  "end_timestamp",
  "timestamp",
  "key",
  "value"
]

export const parseGen2Data = ({message, probe}) => {
  const {data, attributes} = message
  return flatten(
    data.map(event => {
      const timestamp = new Date(event.timestamp * 1000).toISOString()
      const canKey = event.key
      const canValue = event.value
      const embellishedEvent = {...event, [canKey]: canValue}
      return Object.keys(embellishedEvent)
        .filter(dataItemName => !nonDataItemKeys.includes(dataItemName))
        .filter(dataItemName => event[dataItemName] !== null)
        .map(dataItemName => {
          return getDataItem({
            timestamp,
            attributes,
            dataItemName,
            value: getValue(event, dataItemName, probe),
            sequence: event.seq_num
          })
        })
        .filter(e => !!e)
    })
  )
}

const getValue = (event, dataItemName, probe) => {
  let probeForDataItem = probe[dataItemName]
  if (!probeForDataItem) {
    // log here
    probeForDataItem = {}
  }
  const {values_keys: valuesKeys} = probeForDataItem

  if (!valuesKeys) {
    return event[dataItemName] || null
  }

  if (valuesKeys.length > 1) {
    return valuesKeys.reduce((acc, {key, value}) => {
      return {...acc, [key]: event[value] || null}
    }, {})
  }

  return event[valuesKeys[0].value] || null
}

/**
 * values_keys = {
 *   lat: {"key": "lat_deg", "value": "lat_deg"}
 * }
 */
