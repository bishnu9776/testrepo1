/* eslint-disable no-bitwise*/

export const convertLongToBytes = (value, numberOfBytes) => {
  let longValue = value
  const byteArray = []
  for (let i = numberOfBytes; i > 0; i -= 1) {
    byteArray[numberOfBytes] = longValue & 255
    longValue >>= 8
  }
  return byteArray
}
