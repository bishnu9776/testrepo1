import {MCU} from "../../fixtures/bikeChannels/MCU"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"

describe("Parses MCU", () => {
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn()

  it("parses given messages", () => {
    expect(createDataItemsFromMessage({...MCU, probe})).to.eql([
      {
        channel: "mcu",
        data_item_id: "right_brake-v1",
        data_item_name: "right_brake",
        device_uuid: "s_248",
        sequence: 120468,
        timestamp: "2019-10-05T18:26:15.493Z",
        value: 0
      },
      {
        channel: "mcu",
        data_item_id: "left_brake-v1",
        data_item_name: "left_brake",
        device_uuid: "s_248",
        sequence: 120468,
        timestamp: "2019-10-05T18:26:15.493Z",
        value: 0
      },
      {
        channel: "mcu",
        data_item_id: "stop_lamp-v1",
        data_item_name: "stop_lamp",
        device_uuid: "s_248",
        sequence: 120468,
        timestamp: "2019-10-05T18:26:15.493Z",
        value: 0
      },
      {
        channel: "mcu",
        data_item_id: "vcu_status-v1",
        data_item_name: "vcu_status",
        device_uuid: "s_248",
        sequence: 120468,
        timestamp: "2019-10-05T18:26:15.493Z",
        value: 1
      }
    ])
  })
})
