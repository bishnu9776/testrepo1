import {getCreateBikeEventFromMessageFn} from "../../../../src/messageParser/channelParser/bikeChannel"
import {HEMAN} from "../../fixtures/bikeChannels/HEMAN"
import probe from "../../../fixtures/bike-probe.json"
import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {clearEnv} from "../../../utils"

describe("Parses HEMAN", () => {
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
    expect(createDataItemsFromMessage({message: HEMAN})).to.eql([
      {
        channel: "heman",
        data_item_id: "error_code-v1",
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
})
