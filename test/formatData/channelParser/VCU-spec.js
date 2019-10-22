import {VCU} from "../../mocks/VCU"
import {parseChannelMessage} from "../../../src/formatData/channelParser"
import probe from "../../mocks/probe.json"

describe("Parses VCU", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...VCU, probe})).to.eql([
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
