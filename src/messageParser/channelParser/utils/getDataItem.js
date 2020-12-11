import {getHexCANId} from "../bikeChannel/channelDecoder/utils/getHexCANId"

export const getDataItem = ({attributes, dataItemName, timestamp, value, sequence, canId, podId}) => {
  const {device_id: deviceId, channel} = attributes

  return {
    device_uuid: deviceId,
    data_item_name: dataItemName,
    timestamp,
    value,
    ...(channel && {channel}),
    ...(sequence && {sequence}),
    ...(canId && {can_id: getHexCANId(canId)}),
    ...(podId && {pod_id: podId})
  }
}
