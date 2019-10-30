import {parseChannelMessage} from "../../../src/formatData/channelParser"
import {HEMAN} from "../../mocks/HEMAN"
import probe from "../../mocks/probe.json"

describe("Parses HEMAN", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...HEMAN, probe})).to.eql([
      {
        bigsink_timestamp: "2019-10-06T05:22:38.902Z",
        channel: "heman",
        data_item_id: "heman-v1",
        data_item_name: "error_code",
        device_uuid: "s_248",
        is_valid: -1,
        native_code: "M043",
        sequence: 283,
        timestamp: "2019-10-06T05:21:13.807Z",
        condition_level: "FAULT"
      }
    ])
  })
})
