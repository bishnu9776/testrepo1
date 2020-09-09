// eslint-disable-next-line no-new-func
const createFn = eqn => Function("bytes", `return ${eqn}`)

export const populateDecoderConfig = config => {
  const decoder = {}
  config.forEach(e => {
    decoder[e.name] = createFn(e.decode)
  })
  return decoder
}
