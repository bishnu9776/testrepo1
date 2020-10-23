import {getMockLog} from "../../../../stubs/logger"
import {getMockMetricRegistry} from "../../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../../src/messageParser/channelParser/gridChannel"
import {POD_INFO} from "../../../fixtures/gridChannels/preBigSink/POD_INFO"
import {clearEnv} from "../../../../utils"

describe("Parses pre big sink POD_INFO", () => {
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

    expect(createDataItemsFromMessage({message: POD_INFO})).to.eql([
      {
        channel: "pod_info",
        data_item_id: "pod1_id-v1",
        data_item_name: "pod1_id",
        device_uuid: "DB_D81910297370019",
        sequence: 24101008,
        timestamp: "2020-10-18T20:45:30.000Z",
        value: "1048451"
      },
      {
        channel: "pod_info",
        data_item_id: "pod1_firmware_version-v1",
        data_item_name: "pod1_firmware_version",
        device_uuid: "DB_D81910297370019",
        sequence: 24101008,
        timestamp: "2020-10-18T20:45:30.000Z",
        value: "1337275329"
      },
      {
        channel: "pod_info",
        data_item_id: "pod1_hardware_version-v1",
        data_item_name: "pod1_hardware_version",
        device_uuid: "DB_D81910297370019",
        sequence: 24101008,
        timestamp: "2020-10-18T20:45:30.000Z",
        value: "1"
      }
    ])
  })
})
