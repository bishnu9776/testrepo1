import {SOH} from "../../fixtures/bike-channels/SOH"
import {createDataItemsFromMessage} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"

describe("Parses SOH", () => {
  it("parses given messages", () => {
    expect(createDataItemsFromMessage({...SOH, probe})).to.eql([
      {
        bigsink_timestamp: "2019-10-09T07:03:03.397Z",
        channel: "soh",
        data_item_id: "avg_soh_cap-v1",
        data_item_name: "avg_soh_cap",
        device_uuid: "BMS-EOL1",
        sequence: 1,
        timestamp: "2019-10-09T07:03:03.023Z",
        value: 3.4
      },
      {
        bigsink_timestamp: "2019-10-09T07:03:03.397Z",
        channel: "soh",
        data_item_id: "soh_starttime-v1",
        data_item_name: "soh_starttime",
        device_uuid: "BMS-EOL1",
        sequence: 1,
        timestamp: "2019-10-09T07:03:03.023Z",
        value: 1570600972.589
      }
    ])
  })
})
