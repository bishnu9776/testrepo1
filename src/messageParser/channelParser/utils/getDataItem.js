import {getHexCANId} from "../bikeChannel/channelDecoder/utils/getHexCANId"
import {getDataItemId} from "../../../utils/helpers"

export const getDataItem = ({attributes, dataItemName, timestamp, value, sequence, canId, podId}) => {
  const {bike_id: bikeId, channel} = attributes

  return {
    device_uuid: bikeId,
    data_item_name: dataItemName,
    data_item_id: getDataItemId({dataItemName, deviceId: bikeId}),
    timestamp,
    value,
    ...(channel && {channel}),
    ...(sequence && {sequence}),
    ...(canId && {can_id: getHexCANId(canId)}),
    ...(podId && {pod_id: podId})
  }
}
