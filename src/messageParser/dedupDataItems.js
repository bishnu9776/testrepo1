import {ascend, equals, flatten, groupBy, intersection, prop, sortWith} from "ramda"

const valueKeys = ["value", "value_event", "value_sample", "value_location"]
export const dedupDataItems = metricRegistry => {
  return dataItems => {
    const groupedDIs = groupBy(e => `${e.data_item_name}`, dataItems)
    return flatten(
      Object.values(groupedDIs).map(groupedDIValues => {
        const {channel, device_uuid, data_item_name} = groupedDIValues[0] // eslint-disable-line

        metricRegistry.updateStat("Counter", "num_messages_before_dedup", groupedDIValues.length, {channel})

        return sortWith([ascend(prop("timestamp"))])(groupedDIValues).reduce((acc, currentEvent) => {
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
      })
    )
  }
}
