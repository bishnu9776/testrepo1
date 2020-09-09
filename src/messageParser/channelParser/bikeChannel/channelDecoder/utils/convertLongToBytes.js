/* eslint-disable no-bitwise*/

export const convertLongToBytes = value => {
  // eslint-disable-next-line no-undef
  let longValue = BigInt(value)
  const byteArray = []
  for (let i = 7; i >= 0; i -= 1) {
    byteArray[i] = Number(longValue & 255n)
    longValue >>= 8n
  }
  return byteArray
}
