import {convertIntCANIdToHex} from "../channelDecoder/utils/convertIntCANIdToHex"

const getHexCanId = canId => {
  const hexRegex = new RegExp("^0x")
  const isHex = hexRegex.test(canId)
  return isHex ? canId : convertIntCANIdToHex(canId)
}

export const getDataItem = ({attributes, dataItemName, timestamp, value, sequence, canId}) => {
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
    ...(canId && {can_id: getHexCanId(canId)})
  }
}
