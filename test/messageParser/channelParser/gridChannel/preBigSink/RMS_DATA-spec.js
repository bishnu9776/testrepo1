import {getMockLog} from "../../../../stubs/logger"
import {getMockMetricRegistry} from "../../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../../src/messageParser/channelParser/gridChannel"
import {RMS_DATA} from "../../../fixtures/gridChannels/preBigSink/RMS_DATA"
import {clearEnv} from "../../../../utils"
import {RMS_DATA_WITH_TRIP_FLAG} from "../../../fixtures/gridChannels/preBigSink/RMS_DATA_WITH_TRIP_FLAG"

describe("Parses pre big sink RMS_DATA", () => {
  let metricRegistry
  let appContext
  let log

  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
    process.env.VI_GEN1_DATAITEM_ID_VERSION = "v1"
    process.env.VI_RMS_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/rmsDecoderConfig.js"
  })

  afterEach(() => {
    clearEnv()
  })

  it("parses messages without trip flag", () => {
    const createDataItemsFromMessage = getCreateCIEventFromMessageFn(appContext)
    expect(createDataItemsFromMessage({message: RMS_DATA})).to.eql([
      {
        channel: "rms_data",
        data_item_id: "phase1_voltage-v1",
        data_item_name: "phase1_voltage",
        device_uuid: "DB_D81910297370017",
        sequence: 17176728,
        timestamp: "2020-09-09T07:35:33.000Z",
        value: 232
      },
      {
        channel: "rms_data",
        data_item_id: "phase2_voltage-v1",
        data_item_name: "phase2_voltage",
        device_uuid: "DB_D81910297370017",
        sequence: 17176728,
        timestamp: "2020-09-09T07:35:33.000Z",
        value: 0
      },
      {
        channel: "rms_data",
        data_item_id: "phase3_voltage-v1",
        data_item_name: "phase3_voltage",
        device_uuid: "DB_D81910297370017",
        sequence: 17176728,
        timestamp: "2020-09-09T07:35:33.000Z",
        value: 0
      }
    ])
  })

  it("parses data with trip flag", () => {
    const createDataItemsFromMessage = getCreateCIEventFromMessageFn(appContext)
    expect(createDataItemsFromMessage({message: RMS_DATA_WITH_TRIP_FLAG})).to.eql([
      {
        channel: "rms_data",
        data_item_id: "phase1_voltage-v1",
        data_item_name: "phase1_voltage",
        device_uuid: "DB_D81910297370017",
        sequence: 117346,
        timestamp: "2020-10-18T21:51:59.952Z",
        value: 247.5500030517578
      },
      {
        channel: "rms_data",
        data_item_id: "P1_over_voltage-v1",
        data_item_name: "P1_over_voltage",
        device_uuid: "DB_D81910297370017",
        sequence: 117346,
        timestamp: "2020-10-18T21:51:59.952Z",
        value: 0
      },
      {
        channel: "rms_data",
        data_item_id: "P1_under_voltage-v1",
        data_item_name: "P1_under_voltage",
        device_uuid: "DB_D81910297370017",
        sequence: 117346,
        timestamp: "2020-10-18T21:51:59.952Z",
        value: 0
      },
      {
        channel: "rms_data",
        data_item_id: "P1_over_current-v1",
        data_item_name: "P1_over_current",
        device_uuid: "DB_D81910297370017",
        sequence: 117346,
        timestamp: "2020-10-18T21:51:59.952Z",
        value: 0
      },
      {
        channel: "rms_data",
        data_item_id: "P2_over_voltage-v1",
        data_item_name: "P2_over_voltage",
        device_uuid: "DB_D81910297370017",
        sequence: 117346,
        timestamp: "2020-10-18T21:51:59.952Z",
        value: 0
      },
      {
        channel: "rms_data",
        data_item_id: "P2_under_voltage-v1",
        data_item_name: "P2_under_voltage",
        device_uuid: "DB_D81910297370017",
        sequence: 117346,
        timestamp: "2020-10-18T21:51:59.952Z",
        value: 1
      },
      {
        channel: "rms_data",
        data_item_id: "P2_over_current-v1",
        data_item_name: "P2_over_current",
        device_uuid: "DB_D81910297370017",
        sequence: 117346,
        timestamp: "2020-10-18T21:51:59.952Z",
        value: 0
      },
      {
        channel: "rms_data",
        data_item_id: "P3_over_voltage-v1",
        data_item_name: "P3_over_voltage",
        device_uuid: "DB_D81910297370017",
        sequence: 117346,
        timestamp: "2020-10-18T21:51:59.952Z",
        value: 0
      },
      {
        channel: "rms_data",
        data_item_id: "P3_under_voltage-v1",
        data_item_name: "P3_under_voltage",
        device_uuid: "DB_D81910297370017",
        sequence: 117346,
        timestamp: "2020-10-18T21:51:59.952Z",
        value: 1
      },
      {
        channel: "rms_data",
        data_item_id: "P3_over_current-v1",
        data_item_name: "P3_over_current",
        device_uuid: "DB_D81910297370017",
        sequence: 117346,
        timestamp: "2020-10-18T21:51:59.952Z",
        value: 0
      },
      {
        channel: "rms_data",
        data_item_id: "Bad_frequency-v1",
        data_item_name: "Bad_frequency",
        device_uuid: "DB_D81910297370017",
        sequence: 117346,
        timestamp: "2020-10-18T21:51:59.952Z",
        value: 0
      }
    ])
  })
})
