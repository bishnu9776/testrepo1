import {getHexCANId} from "../bikeChannel/channelDecoder/utils/getHexCANId"

export const getDataItem = ({attributes, dataItemName, timestamp, value, sequence, canId, podId}) => {
  const {version, bike_id: bikeId, channel} = attributes
  const dataItemId = JSON.parse(process.env.VI_USE_BIKE_ID_AS_DATA_ITEM_ID_PREFIX || "false")
    ? `${bikeId}-${dataItemName}`
    : `${dataItemName}-${version}`

  return {
    device_uuid: bikeId,
    data_item_name: dataItemName,
    data_item_id: dataItemId,
    timestamp,
    value,
    ...(channel && {channel}),
    ...(sequence && {sequence}),
    ...(canId && {can_id: getHexCANId(canId)}),
    ...(podId && {pod_id: podId})
  }
}
