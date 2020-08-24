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
})
