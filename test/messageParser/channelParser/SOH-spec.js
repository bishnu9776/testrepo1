import {SOH} from "../../fixtures/bikeChannels/SOH"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {getMockLog} from "../../stubs/logger"
import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"

describe("Parses SOH", () => {
  let metricRegistry
  let appContext
  let log
  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateDataItemFromMessageFn(appContext)
    expect(createDataItemsFromMessage({message: SOH, probe})).to.eql([
      {
        channel: "soh",
        data_item_id: "avg_soh_cap-v1",
        data_item_name: "avg_soh_cap",
        device_uuid: "BMS-EOL1",
        sequence: 1,
        timestamp: "2019-10-09T07:03:03.023Z",
        value: 3.4
      },
      {
        channel: "soh",
        data_item_id: "soh_starttime-v1",
        data_item_name: "soh_starttime",
        device_uuid: "BMS-EOL1",
        sequence: 1,
        timestamp: "2019-10-09T07:03:03.023Z",
        value: 1570600972.589
      }
    ])
  })
})
