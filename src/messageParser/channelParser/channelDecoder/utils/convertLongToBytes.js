/* eslint-disable no-bitwise*/

export const convertLongToBytes = (value, numberOfBytes) => {
  let longValue = value
  const isValueNegative = value < 0
  if (isValueNegative) {
    // 2's complement
    longValue = ~longValue
    longValue += 1
  }
  const byteArray = []
  for (let i = numberOfBytes; i > 0; i -= 1) {
    byteArray[numberOfBytes] = longValue & 255
    longValue >>= 8
  }
  return byteArray
}
