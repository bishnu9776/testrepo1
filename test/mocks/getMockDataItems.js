import {repeat} from "ramda"
import {ACK_MSG_TAG} from "../../src/constants"

export const getMockDataItems = numEvents => {
  let sequence = 1
  return repeat(
    {
      device_uuid: 1,
      data_item_name: "mode",
      data_item_id: "mode-v1",
      timestamp: new Date().toISOString(),
      value_event: "abc",
      category: "EVENT",
      channel: "gps",
      bigsink_timestamp: new Date(Date.now() - 12000).toISOString(),
      tag: "MTConnectDataItems"
    },
    numEvents
  )
    .map(event => ({...event, sequence: sequence++}))
    .concat({tag: ACK_MSG_TAG, message: "foo"})
}
