import {getCreateBikeEventFromMessageFn} from "../../../../src/messageParser/channelParser/bikeChannel"
import {EVENTS} from "../../fixtures/bikeChannels/EVENTS"
import probe from "../../../fixtures/probe.json"
import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {clearEnv} from "../../../utils"

describe("Parses EVENTS", () => {
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

    expect(createDataItemsFromMessage({message: EVENTS})).to.eql([
      {
        channel: "events",
        data_item_id: "beta_motorMode2-v1",
        data_item_name: "beta_motorMode2",
        device_uuid: "s_248",
        sequence: 74092,
        timestamp: "2019-10-06T05:11:05.313Z",
        value: "2.443957"
      },
      {
        channel: "events",
        data_item_id: "intercept_motorMode2-v1",
        data_item_name: "intercept_motorMode2",
        device_uuid: "s_248",
        sequence: 74093,
        timestamp: "2019-10-06T05:11:05.314Z",
        value: "7.5228567"
      }
    ])
  })
})
