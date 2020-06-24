export const convertIntCANIdToHex = canId => {
  const hexcanId = Number(canId).toString(16)
  const prefix = "0x"
  const threeDigitHex = hexcanId.padStart(3, "0")
  return `${prefix}${threeDigitHex}`
}
