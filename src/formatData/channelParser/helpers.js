import {log} from "../../logger"

export const getValueKey = ({probeInfo}) => {
  if (probeInfo.category === "SAMPLE") {
    return "value_sample"
  }

  if (probeInfo.category === "EVENT") {
    return "value_event"
  }

  // log warn and event

  return null
}

export const getDataItem = ({attributes, dataItemName, timestamp, value, probe}) => {
  const {version, bike_id: bikeId} = attributes
  const probeInfo = probe[dataItemName] || {}
  const valueKey = getValueKey({probeInfo})

  if (valueKey) {
    return {
      ...probeInfo,
      device_uuid: bikeId,
      data_item_name: dataItemName,
      data_item_id: `${dataItemName}-${version}`,
      timestamp,
      id: `${bikeId}-${dataItemName}-${timestamp}`,
      [valueKey]: value
    }
  }

  log.warn(`Could not find probe for ${dataItemName}. Ignoring event.`)
  return null
}
