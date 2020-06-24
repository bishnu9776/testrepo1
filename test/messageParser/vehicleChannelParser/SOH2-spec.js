import {SOH2} from "../../fixtures/bikeChannels/SOH2"
import {getVehicleMessageParserFn} from "../../../src/messageParser/channelParser/vehicleChannelParser"
import probe from "../../fixtures/probe.json"

describe("Parses SOH2", () => {
  const createDataItemsFromMessage = getVehicleMessageParserFn()

  it("parses given messages", () => {
    expect(createDataItemsFromMessage({...SOH2, probe})).to.eql([
      {
        channel: "soh2",
        data_item_id: "FinalSoHCapacityEstimate_CellBlock_Cell1-v1",
        data_item_name: "FinalSoHCapacityEstimate_CellBlock_Cell1",
        device_uuid: "s_194",
        sequence: 1,
        timestamp: "2019-10-09T09:48:44.689Z",
        value: 1
      },
      {
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
