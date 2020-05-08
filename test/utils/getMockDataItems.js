import {repeat} from "ramda"
import {ACK_MSG_TAG} from "../../src/constants"

export const getMockDataItems = (numEvents, deviceUUID, dataItemName = "mode") => {
  let sequence = 1
  return repeat(
    {
      device_uuid: deviceUUID,
      data_item_name: dataItemName,
      data_item_id: "mode-v1",
      timestamp: "2019-01-01T00:00:00.000Z",
      value_event: "abc",
      category: "EVENT",
      channel: "gps",
      tag: "MTConnectDataItems"
    },
    numEvents
  ).map(event => {
    const eventWithSequence = {...event, sequence}
    sequence += 1
    return eventWithSequence
  })
}

export const getAckEvent = () => {
  return {tag: ACK_MSG_TAG, message: "foo"}
}
