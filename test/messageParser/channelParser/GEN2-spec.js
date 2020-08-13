import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {GEN2} from "../../fixtures/bikeChannels/GEN2"
import {getMockLog} from "../../stubs/logger"
import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"

describe("Parses GEN2", () => {
  let appContext
  let log
  let metricRegistry
  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
    process.env.IS_GEN_2_DATA = "true"
  })

  afterEach(() => {
    delete process.env.IS_GEN_2_DATA
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateDataItemFromMessageFn(appContext)

    expect(createDataItemsFromMessage({message: GEN2, probe})).to.eql([
      {
        data_item_id: "ACC_X_MPS2-s_123",
        data_item_name: "ACC_X_MPS2",
        device_uuid: "s_123",
        timestamp: "2019-10-05T18:27:04.164Z",
        value: 2.23
      },
      {
        data_item_id: "ACC_Y_MPS2-s_123",
        data_item_name: "ACC_Y_MPS2",
        device_uuid: "s_123",
        timestamp: "2019-10-05T18:27:04.164Z",
        value: 3.32
      },
      {
        data_item_id: "ACC_Z_MPS2-s_123",
        data_item_name: "ACC_Z_MPS2",
        device_uuid: "s_123",
        timestamp: "2019-10-05T18:27:04.164Z",
        value: "4.45"
      },
      {
        data_item_id: "BMS_Cell3-s_123",
        data_item_name: "BMS_Cell3",
        device_uuid: "s_123",
        timestamp: "2019-10-05T18:27:04.164Z",
        value: "3.5231"
      },
      {
        data_item_id: "acceleration-s_123",
        data_item_name: "acceleration",
        device_uuid: "s_123",
        timestamp: "2019-10-05T18:27:04.164Z",
        value: {
          x: 2.23,
          y: 3.32,
          z: 4.45
        }
      },
      {
        data_item_id: "acc_x-s_123",
        data_item_name: "acc_x",
        device_uuid: "s_123",
        timestamp: "2019-10-05T18:27:04.164Z",
        value: {
          acc_x: {
            x: 2.23
          }
        }
      }
    ])
  })
})
