export function getMockDataItemDoc({deviceUuid = "device_1", dataItemName, value}) {
  return {
    device_uuid: deviceUuid,
    data_item_name: dataItemName,
    data_item_id: `${dataItemName}-v1`,
    timestamp: new Date().toISOString(),
    value,
    channel: "MCU",
    sequence: 1,
    bigsink_timestamp: new Date(Date.now() - 1000).toISOString()
  }
}
