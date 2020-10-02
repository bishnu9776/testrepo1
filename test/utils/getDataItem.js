export const getDataItem = ({deviceUuid = "device_1", dataItemName, value}) => {
  return {
    device_uuid: deviceUuid,
    data_item_name: dataItemName,
    timestamp: new Date().toISOString(),
    value,
    channel: "MCU",
    sequence: 1
  }
}
