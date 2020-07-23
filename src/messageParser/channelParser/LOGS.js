import {flatten} from "ramda"
const keysToIngnore = ["timestamp", "seq_num", "gpstime_utc", "global_seq", "bike_id", "data", "_comm", "value"]

const getLogDataItem = ({attributes, dataItemName, timestamp, value}) => {
  const {version, bike_id: bikeId, channel} = attributes

  return {
    device_uuid: bikeId,
    data_item_name: dataItemName,
    data_item_id: `${dataItemName}-${version}`,
    timestamp,
    value,
    channel
  }
}

export const parseLOG = ({data, attributes}) => {
  return flatten(
    data.map(event => {
      const timestamp = new Date(event.timestamp * 1000).toISOString()
      const logValueEvent = {message: event.message, source: event._comm}
      return Object.keys(event)
        .filter(dataItemName => !keysToIngnore.includes(dataItemName))
        .map(dataItemName => {
          return getLogDataItem({
            timestamp,
            attributes,
            dataItemName,
            value: logValueEvent
          })
        })
        .filter(e => !!e)
    })
  )
}
