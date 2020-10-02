import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../src/messageParser/channelParser/gridChannel"
import {RMS_DATA} from "../../fixtures/gridChannels/RMS_DATA"
import {clearEnv} from "../../../utils"

describe("Parses RMS_DATA", () => {
  let metricRegistry
  let appContext
  let log

  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
    process.env.VI_GEN1_DATAITEM_ID_VERSION = "v1"
  })

  afterEach(() => {
    clearEnv()
  })

  it("parses given messages", () => {
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
})
