import {SESSION} from "../../fixtures/bikeChannels/SESSION"
import {getCreateBikeEventFromMessageFn} from "../../../../src/messageParser/channelParser/bikeChannel"
import probe from "../../../fixtures/bike-probe.json"
import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {clearEnv} from "../../../utils"

describe("Parses SESSION", () => {
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
    expect(createDataItemsFromMessage({message: SESSION})).to.eql([
      {
        channel: "session",
        data_item_id: "vehicle_status-v1",
        data_item_name: "vehicle_status",
        device_uuid: "s_248",
        end_ts: "2019-10-06T14:24:26.646Z",
        is_visible: 1,
        sequence: 66,
        session_id: 1402,
        start_ts: "2019-10-06T12:25:09.583Z",
        timestamp: "2019-10-06T14:31:26.646Z"
      }
    ])
  })
})
