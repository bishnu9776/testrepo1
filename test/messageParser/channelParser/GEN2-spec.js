import path from "path"
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
  const pathToFixtures = path.join(process.cwd(), "test/fixtures")

  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
    process.env.VI_COLLECTOR_IS_GEN_2_DATA = "true"
    process.env.USE_BIKE_ID_AS_DATA_ITEM_ID_PREFIX = "true"
    process.env.VI_COLLECTOR_VALUES_KEYS_MAPPING_PATH = `${pathToFixtures}/values_keys_mapping.json`
    process.env.VI_COLLECTOR_VALUES_SCHEMA_PATH = `${pathToFixtures}/values_schema.json`
  })

  afterEach(() => {
    delete process.env.VI_COLLECTOR_IS_GEN_2_DATA
    delete process.env.USE_BIKE_ID_AS_DATA_ITEM_ID_PREFIX
    delete process.env.VI_COLLECTOR_VALUES_KEYS_MAPPING_PATH
    delete process.env.VI_COLLECTOR_VALUES_SCHEMA_PATH
  })

  it("parses buffered messages", () => {
    const createDataItemsFromMessage = getCreateDataItemFromMessageFn(appContext, probe)

    const parsedDataItem = (dataItemName, value) => ({
      channel: "buffered_channel",
      data_item_id: `s_123-${dataItemName}`,
      data_item_name: dataItemName,
      device_uuid: "s_123",
      timestamp: "2019-10-05T18:27:04.164Z",
      value
    })

    expect(createDataItemsFromMessage({message: GEN2})).to.eql([
      parsedDataItem("ACC_X_MPS2", 2.23),
      parsedDataItem("ACC_Y_MPS2", 3.32),
      parsedDataItem("ACC_Z_MPS2", "4.45"),
      parsedDataItem("BMS_Cell3", "3.5231"),
      parsedDataItem("acceleration", {x: 2.23, y: 3.32, z: 4.45}),
      parsedDataItem("acc_x", {x: 2.23})
    ])
  })
  it("parses can raw messages", () => {
    const createDataItemsFromMessage = getCreateDataItemFromMessageFn(appContext, probe)
    const parsedDataItem = (timestamp, value) => ({
      attributes: {
        bike_id: "s_3739",
        channel: "buffered_channel",
        version: "v1"
      },
      channel: "buffered_channel",
      data_item_name: "can_raw",
      device_uuid: "s_3739",
      timestamp,
      value
    })
    expect(createDataItemsFromMessage({message: GEN2_CAN_RAW})).to.eql([
      parsedDataItem("2020-07-21T08:58:19.501Z", {
        can_id: 132,
        data: "-2621409860442463330",
        timestamp: 1595321899.501
      }),
      parsedDataItem("2020-08-14T12:53:57.437Z", {can_id: 131, data: "0892e891ee91e491", timestamp: 1597409637.437})
    ])
  })
})
