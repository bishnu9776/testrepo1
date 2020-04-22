import {flatten} from "ramda"
import {getDataItem} from "./helpers"
import {canParser} from "./can-parser"

const {env} = process

export const parseCAN = message => {
  const {data, attributes} = message
  let parsedData = []

  const shouldParseData = JSON.parse(env.VI_SHOULD_PARSE_DATA || "false")
  const canParserConfigPath =
    env.VI_CAN_PARSER_CONFIG_PATH || "../../../test/fixtures/bike-channels/can-parser-config.json"

  // eslint-disable-next-line global-require,import/no-dynamic-require
  const canParserConfig = require(canParserConfigPath)

  if (shouldParseData) {
    parsedData = canParser(canParserConfig)(message)
  } else {
    data.map(e => parsedData.push(...e.parsed))
  }

  // should call the parse function, get the parsed data and use it instead of event.parsed
  // [e1, e2, e3, e4] = parsedEvent
  // TODO: check whether flattern and filter is any more required.
  return flatten(
    parsedData.map(e => {
      const timestamp = new Date(e.timestamp * 1000).toISOString()
      return getDataItem({
        dataItemName: e.key,
        attributes,
        timestamp,
        value: e.value,
        sequence: e.seq_num,
        bigSinkTimestamp: `${e.bigsink_timestamp}Z`
      })
    })
  ).filter(e => !!e)
}
