import {SOH2} from "../mockChannelData/SOH2"
import {parseChannelMessage} from "../../../src/gcpMessageParser/channelParser"
import probe from "../../mocks/probe.json"

describe("Parses SOH2", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...SOH2, probe})).to.eql([
      {
        bigsink_timestamp: "2019-10-09T09:48:46.770Z",
        channel: "soh2",
        data_item_id: "FinalSoHCapacityEstimate_CellBlock_Cell1-v1",
        data_item_name: "FinalSoHCapacityEstimate_CellBlock_Cell1",
        device_uuid: "s_194",
        sequence: 1,
        timestamp: "2019-10-09T09:48:44.689Z",
        value: 1
      },
      {
        bigsink_timestamp: "2019-10-09T09:48:46.770Z",
        channel: "soh2",
        data_item_id: "FinalSoHCapacityEstimate_CellBlock_Cell2-v1",
        data_item_name: "FinalSoHCapacityEstimate_CellBlock_Cell2",
        device_uuid: "s_194",
        sequence: 2,
        timestamp: "2019-10-09T09:48:44.689Z",
        value: 1
      }
    ])
  })
})
