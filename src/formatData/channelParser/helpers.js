import {ascend, equals, flatten, groupBy, intersection, prop, sortWith} from "ramda"

export const getValueKey = ({probeInfo, dataItemName}) => {
  if (dataItemName === "acc" || dataItemName === "gyr") {
    return "value_xyz"
  }

  if (!probeInfo) {
    return "value"
  }

  if (probeInfo.category === "SAMPLE") {
    return "value_sample"
  }

  if (probeInfo.category === "EVENT") {
    return "value_event"
  }

  if (probeInfo.category === "LOCATION") {
    return "value_location"
  }

  return "value"
}

export const getDataItem = ({attributes, dataItemName, timestamp, value, sequence}) => {
  const {version, bike_id: bikeId, channel} = attributes

  return {
    device_uuid: bikeId,
    data_item_name: dataItemName,
    data_item_id: `${dataItemName}-${version}`,
    timestamp,
    value,
    channel,
    sequence
  }
}

const valueKeys = ["value", "value_event", "value_sample", "value_location", "value_xyz"]

export const dedupData = metricRegistry => dataItems => {
  const groupedDIs = groupBy(e => `${e.data_item_name}`, dataItems)
  return flatten(
    Object.values(groupedDIs).map(groupedDIValues => {
    const {channel, device_uuid, data_item_name} = groupedDIValues[0] // eslint-disable-line
      metricRegistry.updateStat("Counter", "num_messages_before_dedup", groupedDIValues.length, {
        channel,
        device_uuid,
        data_item_name
      })

      const sortedEvents = sortWith([ascend(prop("timestamp"))])(groupedDIValues).reduce((acc, currentEvent) => {
        if (acc.length) {
          const previousEvent = acc[acc.length - 1]
          const valueKey = intersection(Object.keys(currentEvent), valueKeys)[0]
          if (equals(currentEvent[valueKey], previousEvent[valueKey])) {
            return acc
          }
          acc.push(currentEvent)

          //
        } else {
          acc.push(currentEvent)
        }
        return acc
      }, [])

      return sortedEvents
    })
  )
}
