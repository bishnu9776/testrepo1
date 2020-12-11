import {SOH} from "../../fixtures/bikeChannels/SOH"
import {getCreateBikeEventFromMessageFn} from "../../../../src/messageParser/channelParser/bikeChannel"
import probe from "../../../fixtures/bike-probe.json"
import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {clearEnv} from "../../../utils"

describe("Parses SOH", () => {
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
    const createDataItemsFromMessage = getCreateBikeEventFromMessageFn(appContext, probe)
    expect(createDataItemsFromMessage({message: SOH})).to.eql([
      {
        channel: "soh",
        data_item_name: "avg_soh_cap",
        device_uuid: "BMS-EOL1",
        sequence: 1,
        timestamp: "2019-10-09T07:03:03.023Z",
        value: 3.4
      },
      {
        channel: "soh",
        data_item_name: "soh_starttime",
        device_uuid: "BMS-EOL1",
        sequence: 1,
        timestamp: "2019-10-09T07:03:03.023Z",
        value: 1570600972.589
      }
    ])
  })
})
