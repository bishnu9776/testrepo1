import {getVehicleMessageParserFn} from "../../../src/messageParser/channelParser/vehicleChannelParser"
import {HEMAN} from "../../fixtures/bikeChannels/HEMAN"
import probe from "../../fixtures/probe.json"

describe("Parses HEMAN", () => {
  const createDataItemsFromMessage = getVehicleMessageParserFn()

  it("parses given messages", () => {
    expect(createDataItemsFromMessage({...HEMAN, probe})).to.eql([
      {
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
