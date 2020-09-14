import {flatten, isNil} from "ramda"
import {getDataItem} from "../utils/getDataItem"
import {getValuesFn} from "../utils/getValues"
import {parseCANRAW} from "./CAN_RAW"

const nonDataItemKeys = ["data", "can_id", "key", "value", "timestamp", "start_timestamp", "end_timestamp"]

const isCANRAW = event => {
  return !isNil(event.can_id) && !isNil(event.data)
}

export const parseGen2BufferedData = (appContext, probe) => {
  const {log} = appContext
  const syntheticDataItemNameList = Object.values(probe)
    .filter(dataItemProbe => dataItemProbe.synthetic)
    .map(dataItemProbe => dataItemProbe.data_item_name)

  const getValues = getValuesFn(probe, log)

  return ({message}) => {
    const {data, attributes} = message
    return flatten(
      data.map(event => {
        const timestamp = new Date(event.timestamp * 1000).toISOString()
        const {key, value} = event
        const embellishedEvent = {...event}
        if (!isNil(key)) {
          embellishedEvent[key] = value
        }
        if (isCANRAW(event)) {
          return parseCANRAW({data: [event], attributes})
        }
        return [...Object.keys(embellishedEvent), ...syntheticDataItemNameList]
          .filter(dataItemName => !nonDataItemKeys.includes(dataItemName))
          .filter(dataItemName => embellishedEvent[dataItemName] !== null)
          .map(dataItemName => {
            return getDataItem({
              timestamp,
              attributes,
              dataItemName,
              value: getValues({event: embellishedEvent, dataItemName}),
              sequence: event.seq_num
            })
          })
          .filter(e => !!e && !isNil(e.value))
      })
    )
  }
}
