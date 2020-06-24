import {BIKEINFO} from "../../fixtures/bikeChannels/BIKEINFO"
import {getVehicleMessageParserFn} from "../../../src/messageParser/channelParser/vehicleChannelParser"
import probe from "../../fixtures/probe.json"

describe("Parses BIKEINFO", () => {
  const createDataItemsFromMessage = getVehicleMessageParserFn()

  it("parses given messages", () => {
    expect(createDataItemsFromMessage({...BIKEINFO, probe})).to.eql([
      {
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
