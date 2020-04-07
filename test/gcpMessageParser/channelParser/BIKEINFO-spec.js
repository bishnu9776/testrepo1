import {BIKEINFO} from "../mockChannelData/BIKEINFO"
import {parseChannelMessage} from "../../../src/gcpMessageParser/channelParser"
import probe from "../../mocks/probe.json"

describe("Parses BIKEINFO", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...BIKEINFO, probe})).to.eql([
      {
        bigsink_timestamp: "2019-10-07T11:20:34.634Z",
        channel: "bike_info",
        data_item_id: "bike_info-v1",
        data_item_name: "bike_info",
        device_uuid: "s_248",
        end_timestamp: "",
        isvisible: -1,
        sequence: 1,
        session_id: 2215,
        start_timestamp: "1.57044723436e+09",
        timestamp: "2019-10-07T11:20:34.360Z",
        value: null,
        vehicle_status: "Riding"
      }
    ])
  })
})
