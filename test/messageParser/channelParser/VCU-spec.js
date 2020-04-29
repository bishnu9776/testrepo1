import {VCU} from "../../fixtures/bikeChannels/VCU"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"

describe("Parses VCU", () => {
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn()

  it("parses given messages", () => {
    expect(createDataItemsFromMessage({...VCU, probe})).to.eql([
      {
        bigsink_timestamp: "2019-10-12T21:24:07.927Z",
        channel: "vcu",
        data_item_id: "bluetooth_device_status-v1",
        data_item_name: "bluetooth_device_status",
        device_uuid: "s_194",
        sequence: 6389,
        timestamp: "2019-10-12T21:23:13.027Z",
        value: 0
      },
      {
        bigsink_timestamp: "2019-10-12T21:24:07.927Z",
        channel: "vcu",
        data_item_id: "odometer-v1",
        data_item_name: "odometer",
        device_uuid: "s_194",
        sequence: 6389,
        timestamp: "2019-10-12T21:23:13.027Z",
        value: 221596
      },
      {
        bigsink_timestamp: "2019-10-12T21:24:07.927Z",
        channel: "vcu",
        data_item_id: "screen_brightness_control-v1",
        data_item_name: "screen_brightness_control",
        device_uuid: "s_194",
        sequence: 6389,
        timestamp: "2019-10-12T21:23:13.027Z",
        value: 0
      }
    ])
  })
})
