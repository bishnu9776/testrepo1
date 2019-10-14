import {groupBy, sortWith, ascend, prop, intersection, equals, flatten} from "ramda"

export const getValueKey = ({probeInfo}) => {
  if (probeInfo.category === "SAMPLE") {
    return "value_sample"
  }

  if (probeInfo.category === "EVENT") {
    return "value_event"
  }

  return null
}

export const getDataItem = ({attributes, dataItemName, timestamp, value, probe, sequence}) => {
  const {version, bike_id: bikeId, channel} = attributes
  const probeInfo = probe[dataItemName] || {}
  const valueKey = getValueKey({probeInfo})

  if (valueKey) {
    return {
      ...probeInfo,
      device_uuid: bikeId,
      data_item_name: dataItemName,
      data_item_id: `${dataItemName}-${version}`,
      timestamp,
      [valueKey]: value,
      channel,
      sequence
    }
  }

  return {
    device_uuid: bikeId,
    data_item_name: dataItemName,
    data_item_id: `${dataItemName}-${version}`,
    timestamp,
    value: value.toString(),
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
