export const getDataItem = ({attributes, dataItemName, timestamp, value, sequence, canId}) => {
  const {version, bike_id: bikeId, channel} = attributes

  return {
    device_uuid: bikeId,
    data_item_name: dataItemName,
    data_item_id: `${dataItemName}-${version}`,
    timestamp,
    value,
    channel,
    sequence,
    ...(canId && {can_id: canId})
  }
}
