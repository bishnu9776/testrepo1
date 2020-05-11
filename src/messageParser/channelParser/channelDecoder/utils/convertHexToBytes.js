const createByteArray = (value, numberOfBytes) => {
  const byteArray = []
  for (let i = 0; i < numberOfBytes; i += 2) {
    byteArray.push(`${value[i]}${value[i + 1]}`)
  }
  return byteArray
}

export const convertHexToBytes = (value, numberOfBytes) => {
  const byteArray = createByteArray(value, numberOfBytes)
  return byteArray.map(s => parseInt(s, 16))
}
