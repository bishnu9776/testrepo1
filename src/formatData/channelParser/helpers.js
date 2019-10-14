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
