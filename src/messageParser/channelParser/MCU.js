import {flatten} from "ramda"
import {getDataItem} from "./helpers"
import {nonDataItemKeys} from "../../constants"
import {getMCUDecoder} from "./channelDecoder/getMCUDecoder"

export const parseMCU = () => {
  const {env} = process
  const shouldDecodeMessage = JSON.parse(env.VI_PRE_BIG_SINK_INPUT || "false")
  const decodeMCUMessage = shouldDecodeMessage ? getMCUDecoder() : null

  return message => {
    const {data, attributes} = message
    let decodedMessage = data

    if (shouldDecodeMessage) {
      decodedMessage = decodeMCUMessage(message)
    }

    return flatten(
      decodedMessage.map(event => {
        const timestamp = new Date(event.timestamp * 1000).toISOString()
        return Object.keys(event)
          .filter(dataItemName => !nonDataItemKeys.includes(dataItemName))
          .map(dataItemName => {
            return getDataItem({
              timestamp,
              attributes,
              dataItemName,
              value: event[dataItemName],
              sequence: event.seq_num
            })
          })
          .filter(e => !!e)
      })
    )
  }
}
