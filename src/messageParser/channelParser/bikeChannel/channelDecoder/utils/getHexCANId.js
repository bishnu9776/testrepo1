import {convertIntCANIdToHex} from "./convertIntCANIdToHex"

export const getHexCANId = canId => {
  const hexRegex = new RegExp("^0x")
  const isHex = hexRegex.test(canId)
  return isHex ? canId : convertIntCANIdToHex(canId)
}
