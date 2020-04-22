import {keys} from "ramda"
/**
 * should get the pasrer json from env file path
 * create configObj with function
 * create defaultConfig for legacy
 */

// const canParserPath = process.env.VI_CAN_PARSER_PATH || "../../../test/fixtures/bike-channels/can-parser"

// const parser = require(canParserPath)
const parserConfig = {}

// eslint-disable-next-line no-new-func
const createFn = eqn => Function("bytes", `return ${eqn}`)

export const canParser = parser => event => {
  const {attributes, data} = event
  const {canRaw} = data[0]
  const input = canRaw.data

  const bytes = [
    `${input[0]}${input[1]}`,
    `${input[2]}${input[3]}`,
    `${input[4]}${input[5]}`,
    `${input[6]}${input[7]}`,
    `${input[8]}${input[9]}`,
    `${input[10]}${input[11]}`,
    `${input[12]}${input[13]}`,
    `${input[14]}${input[15]}`
  ].map(s => parseInt(s, 16))

  const componentNames = keys(parser)
  componentNames.map(name => {
    const variants = keys(parser[name])
    return variants.map(variant => {
      const codes = keys(parser[name][variant])
      return codes.map(code => {
        return parser[name][variant][code].map(e => {
          parserConfig[`${name}.${variant}.${code}.${e.params}`] = createFn(e.equation)
          return parserConfig
        })
      })
    })
  })

  // const parsedData = {}
  //
  return bytes
}
