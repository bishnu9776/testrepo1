export const getDataItem = ({attributes, dataItemName, timestamp, value, sequence, bigSinkTimestamp}) => {
  const {version, bike_id: bikeId, channel} = attributes

  return {
    device_uuid: bikeId,
    data_item_name: dataItemName,
    data_item_id: `${dataItemName}-${version}`,
    timestamp,
    value,
    channel,
    sequence,
    bigsink_timestamp: bigSinkTimestamp
  }
}
