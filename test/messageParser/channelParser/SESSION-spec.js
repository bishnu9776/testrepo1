import {SESSION} from "../../fixtures/bikeChannels/SESSION"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"

describe("Parses SESSION", () => {
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn()

  it("parses given messages", () => {
    expect(createDataItemsFromMessage({...SESSION, probe})).to.eql([
      {
        bigsink_timestamp: "2019-10-06T14:31:27.069Z",
        channel: "session",
        data_item_id: "vehicle_status-v1",
        data_item_name: "vehicle_status",
        device_uuid: "s_248",
        end_ts: "2019-10-06T14:24:26.646Z",
        is_visible: 1,
        sequence: 66,
        session_id: 1402,
        start_ts: "2019-10-06T12:25:09.583Z",
        timestamp: "2019-10-06T14:31:26.646Z"
      }
    ])
  })
})
