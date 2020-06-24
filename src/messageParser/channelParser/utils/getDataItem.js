export const getDataItem = ({attributes, dataItemName, timestamp, value, sequence, deployProfile}) => {
  const {version, channel} = attributes
  let deviceId
  if (deployProfile === "grid") {
    deviceId = attributes.db_id
  } else {
    deviceId = attributes.bike_id
  }

  return {
    device_uuid: deviceId,
    data_item_name: dataItemName,
    data_item_id: `${dataItemName}-${version}`,
    timestamp,
    value,
    channel,
    sequence
  }
}

export const getGridDataItem = ({attributes, dataItemName, timestamp, value, sequence}) => {
  const {version, db_id: dbId, channel} = attributes

  return {
    device_uuid: dbId,
    data_item_name: dataItemName,
    data_item_id: `${dataItemName}-${version}`,
    timestamp,
    value,
    channel,
    sequence
  }
}
