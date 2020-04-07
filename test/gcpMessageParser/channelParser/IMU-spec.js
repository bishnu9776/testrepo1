import {parseChannelMessage} from "../../../src/gcpMessageParser/channelParser"
import {IMU} from "../mockChannelData/IMU"
import probe from "../../mocks/probe.json"

describe("Parses IMU", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...IMU, probe})).to.eql([
      {
        bigsink_timestamp: "2019-10-06T05:22:49Z",
        channel: "imu",
        data_item_id: "acc_x_mps2-v1",
        data_item_name: "acc_x_mps2",
        device_uuid: "s_248",
        sequence: 10645396,
        timestamp: "2019-10-06T05:11:56.748Z",
        value: -0.16491222
      },
      {
        bigsink_timestamp: "2019-10-06T05:22:49Z",
        channel: "imu",
        data_item_id: "gyr_z_deg-v1",
        data_item_name: "gyr_z_deg",
        device_uuid: "s_248",
        sequence: 10645397,
        timestamp: "2019-10-06T05:11:56.764Z",
        value: -0.013973308
      }
    ])
  })
})
