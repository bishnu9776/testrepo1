import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../src/messageParser/channelParser/gridChannel"
import {POD_INFO} from "../../fixtures/gridChannels/POD_INFO"

describe("Parses POD_INFO", () => {
  let metricRegistry
  let appContext
  let log

  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateCIEventFromMessageFn(appContext)

    expect(createDataItemsFromMessage({message: POD_INFO})).to.eql([
      {
        channel: "pod_info",
        data_item_id: "pod1_id-v1_5",
        data_item_name: "pod1_id",
        device_uuid: "DB_D81910297370014",
        sequence: 23167558,
        timestamp: "2020-09-09T07:32:49.000Z",
        value: "1048454"
      },
      {
        channel: "pod_info",
        data_item_id: "pod1_firmware_version-v1_5",
        data_item_name: "pod1_firmware_version",
        device_uuid: "DB_D81910297370014",
        sequence: 23167558,
        timestamp: "2020-09-09T07:32:49.000Z",
        value: "1337275329"
      },
      {
        channel: "pod_info",
        data_item_id: "pod1_hardware_version-v1_5",
        data_item_name: "pod1_hardware_version",
        device_uuid: "DB_D81910297370014",
        sequence: 23167558,
        timestamp: "2020-09-09T07:32:49.000Z",
        value: "1"
      }
    ])
  })
})
