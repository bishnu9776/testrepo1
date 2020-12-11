import {getMockLog} from "../../../../stubs/logger"
import {getMockMetricRegistry} from "../../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../../src/messageParser/channelParser/gridChannel"
import {DB_INFO} from "../../../fixtures/gridChannels/preBigSink/DB_INFO"

describe("Parses pre big sink DB_INFO", () => {
  let metricRegistry
  let appContext
  let log

  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
    process.env.VI_GEN1_DATAITEM_ID_VERSION = "v2"
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateCIEventFromMessageFn(appContext)

    expect(createDataItemsFromMessage({message: DB_INFO})).to.eql([
      {
        channel: "db_info",
        data_item_name: "mac_address",
        device_uuid: "DB_D81910297370011",
        sequence: 245634,
        timestamp: "2020-08-24T06:08:01.000Z",
        value: "00-00-1c-a0-d3-e1-1a-bc"
      },
      {
        channel: "db_info",
        data_item_name: "mender_artifact_ver",
        device_uuid: "DB_D81910297370011",
        sequence: 245634,
        timestamp: "2020-08-24T06:08:01.000Z",
        value: "0"
      },
      {
        channel: "db_info",
        data_item_name: "rms_firmware_version",
        device_uuid: "DB_D81910297370011",
        sequence: 245634,
        timestamp: "2020-08-24T06:08:01.000Z",
        value: "HE518086"
      },
      {
        channel: "db_info",
        data_item_name: "obc_firmware_version",
        device_uuid: "DB_D81910297370011",
        sequence: 245634,
        timestamp: "2020-08-24T06:08:01.000Z",
        value: "37.15.05"
      },
      {
        channel: "db_info",
        data_item_name: "gsm_modem_status",
        device_uuid: "DB_D81910297370011",
        sequence: 245634,
        timestamp: "2020-08-24T06:08:01.000Z",
        value: 1
      },
      {
        channel: "db_info",
        data_item_name: "reset_cause",
        device_uuid: "DB_D81910297370011",
        sequence: 245634,
        timestamp: "2020-08-24T06:08:01.000Z",
        value: 0
      }
    ])
  })
})
