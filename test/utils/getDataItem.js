export const getDataItem = ({
  deviceUuid = "device_1",
  dataItemName,
  value,
  schemaVersion = process.env.VI_SCHEMA_VERSION
}) => {
  return {
    device_uuid: deviceUuid,
    data_item_name: dataItemName,
    data_item_id: `${dataItemName}-v${schemaVersion}`,
    timestamp: new Date().toISOString(),
    value,
    channel: "MCU",
    sequence: 1,
    bigsink_timestamp: new Date(Date.now() - 1000).toISOString()
  }
}
