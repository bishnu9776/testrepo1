import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {GEN2} from "../../fixtures/bikeChannels/GEN2"
import {GEN2_CAN_RAW} from "../../fixtures/bikeChannels/GEN2_CAN_RAW"
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
    process.env.USE_BIKE_ID_AS_DATA_ITEM_ID_PREFIX = "true"
  })

  afterEach(() => {
    delete process.env.IS_GEN_2_DATA
    delete process.env.USE_BIKE_ID_AS_DATA_ITEM_ID_PREFIX
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateDataItemFromMessageFn(appContext)

    const parsedDataItem = (dataItemName, value) => ({
      channel: "buffered_channel",
      data_item_id: `s_123-${dataItemName}`,
      data_item_name: dataItemName,
      device_uuid: "s_123",
      timestamp: "2019-10-05T18:27:04.164Z",
      value
    })

    expect(createDataItemsFromMessage({message: GEN2, probe})).to.eql([
      parsedDataItem("ACC_X_MPS2", 2.23),
      parsedDataItem("ACC_Y_MPS2", 3.32),
      parsedDataItem("ACC_Z_MPS2", "4.45"),
      parsedDataItem("BMS_Cell3", "3.5231"),
      parsedDataItem("acceleration", {x: 2.23, y: 3.32, z: 4.45}),
      parsedDataItem("acc_x", {acc_x: {x: 2.23}})
    ])
  })
  it("parses can raw messages", () => {
    const createDataItemsFromMessage = getCreateDataItemFromMessageFn(appContext)
    expect(createDataItemsFromMessage({message: GEN2_CAN_RAW, probe})).to.eql([
      {
        attributes: {
          deviceId: "s_3739",
          channel: "buffered_channel",
          version: "v1"
        },
        data_item_name: "can_raw",
        device_uuid: "s_3739",
        timestamp: "2020-07-21T08:58:19.501Z",
        value: {
          can_id: 132,
          data: "-2621409860442463330",
          timestamp: 1595321899.501
        }
      },
      {
        attributes: {
          deviceId: "s_3739",
          channel: "buffered_channel",
          version: "v1"
        },
        data_item_name: "can_raw",
        device_uuid: "s_3739",
        timestamp: "2020-08-14T12:53:57.437Z",
        value: {
          can_id: 131,
          data: "0892e891ee91e491",
          timestamp: 1597409637.437
        }
      }
    ])
  })
})
