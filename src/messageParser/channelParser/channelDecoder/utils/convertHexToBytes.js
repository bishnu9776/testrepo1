const createByteArray = (value, number) => {
  const byteArray = []
  for (let i = 0; i < number; i += 2) {
    byteArray.push(`${value[i]}${value[i + 1]}`)
  }
  return byteArray
}

export const convertHexToBytes = (value, number) => {
  const byteArray = createByteArray(value, number)
  return byteArray.map(s => parseInt(s, 16))
}
