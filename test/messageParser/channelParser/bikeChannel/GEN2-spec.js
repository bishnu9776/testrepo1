import {getCreateBikeEventFromMessageFn} from "../../../../src/messageParser/channelParser/bikeChannel"
import probe from "../../../fixtures/bike-probe.json"
import {GEN2_CAN_RAW} from "../../fixtures/bikeChannels/GEN2_CAN_RAW"
import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {UNBUFFERED, UNBUFFERED_STRICT} from "../../fixtures/bikeChannels/UNBUFFERED"
import {clearEnv, setGen2Envs} from "../../../utils"
import {GEN2_BUFFERED} from "../../fixtures/bikeChannels/GEN2_BUFFERED"
import {GEN2_LOGS} from "../../fixtures/bikeChannels/GEN2_LOGS"

describe("Parses GEN2", () => {
  let appContext
  let log
  let metricRegistry

  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
    setGen2Envs()
  })

  afterEach(() => {
    clearEnv()
  })

  it("parses buffered messages", () => {
    const createDataItemsFromMessage = getCreateBikeEventFromMessageFn(appContext, probe)

    const parsedDataItem = (dataItemName, value) => ({
      channel: "buffered_channel",
      data_item_id: `s_123-${dataItemName}`,
      data_item_name: dataItemName,
      device_uuid: "s_123",
      timestamp: "2019-10-05T18:27:04.164Z",
      value
    })

    expect(createDataItemsFromMessage({message: GEN2_BUFFERED})).to.eql([
      parsedDataItem("ACC_X_MPS2", 2.23),
      parsedDataItem("ACC_Y_MPS2", 3.32),
      parsedDataItem("ACC_Z_MPS2", "4.45"),
      parsedDataItem("BMS_Cell3", "3.5231"),
      parsedDataItem("acceleration", {x: 2.23, y: 3.32, z: 4.45}),
      parsedDataItem("acc_x", {x: 2.23})
    ])
  })

  it("parses log messages", () => {
    const createDataItemsFromMessage = getCreateBikeEventFromMessageFn(appContext, probe)

    const parsedDataItem = (dataItemName, value) => ({
      channel: "logs",
      data_item_id: `s_123-${dataItemName}`,
      data_item_name: dataItemName,
      device_uuid: "s_123",
      timestamp: "2019-10-05T18:27:04.164Z",
      value
    })

    expect(createDataItemsFromMessage({message: GEN2_LOGS})).to.eql([
      parsedDataItem("message", {message: "This is a log message", source: "Source is undefined"}),
      parsedDataItem("_comm", "Source is undefined")
    ])
  })

  it("parses can raw messages", () => {
    const createDataItemsFromMessage = getCreateBikeEventFromMessageFn(appContext, probe)
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

  it("parses unbuffered messages", () => {
    const createDataItemsFromMessage = getCreateBikeEventFromMessageFn(appContext, probe)
    expect(createDataItemsFromMessage({message: UNBUFFERED, probe})).to.eql([
      {
        channel: "unbuffered_channel",
        data_item_id: "s_248-error_code",
        data_item_name: "error_code",
        device_uuid: "s_248",
        is_valid: -1,
        native_code: "M043",
        sequence: 283,
        timestamp: "2019-10-06T05:21:13.807Z",
        condition_level: "FAULT"
      }
    ])
  })

  it("parses unbuffered messages without keys - is valid, seq no", () => {
    const createDataItemsFromMessage = getCreateBikeEventFromMessageFn(appContext, probe)
    expect(createDataItemsFromMessage({message: UNBUFFERED_STRICT, probe})).to.eql([
      {
        channel: "unbuffered_channel",
        data_item_id: "s_248-error_code",
        data_item_name: "error_code",
        device_uuid: "s_248",
        native_code: "M043",
        timestamp: "2019-10-06T05:21:13.807Z",
        condition_level: "FAULT"
      }
    ])
  })
})
