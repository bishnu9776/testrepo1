import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import {IMU} from "../../fixtures/bikeChannels/IMU"
import probe from "../../fixtures/probe.json"
import {getMockLog} from "../../stubs/logger"
import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"

describe("Parses IMU", () => {
  let metricRegistry
  let appContext
  let log
  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
  })
  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateDataItemFromMessageFn(appContext)
    expect(createDataItemsFromMessage({message: IMU, probe})).to.eql([
      {
        channel: "imu",
        data_item_id: "acc_x_mps2-v1",
        data_item_name: "acc_x_mps2",
        device_uuid: "s_248",
        sequence: 10645396,
        timestamp: "2019-10-06T05:11:56.748Z",
        value: -0.16491222
      },
      {
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
