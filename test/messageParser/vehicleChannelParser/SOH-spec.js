import {SOH} from "../../fixtures/bikeChannels/SOH"
import {getVehicleMessageParserFn} from "../../../src/messageParser/channelParser/vehicleChannelParser"
import probe from "../../fixtures/probe.json"

describe("Parses SOH", () => {
  const createDataItemsFromMessage = getVehicleMessageParserFn()

  it("parses given messages", () => {
    expect(createDataItemsFromMessage({...SOH, probe})).to.eql([
      {
        channel: "soh",
        data_item_id: "avg_soh_cap-v1",
        data_item_name: "avg_soh_cap",
        device_uuid: "BMS-EOL1",
        sequence: 1,
        timestamp: "2019-10-09T07:03:03.023Z",
        value: 3.4
      },
      {
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
