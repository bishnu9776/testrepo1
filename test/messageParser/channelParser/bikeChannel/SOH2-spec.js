import {SOH2} from "../../fixtures/bikeChannels/SOH2"
import {getCreateBikeEventFromMessageFn} from "../../../../src/messageParser/channelParser/bikeChannel"
import probe from "../../../fixtures/probe.json"
import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {clearEnv} from "../../../utils"

describe("Parses SOH2", () => {
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
    expect(createDataItemsFromMessage({message: SOH2})).to.eql([
      {
        channel: "soh2",
        data_item_id: "FinalSoHCapacityEstimate_CellBlock_Cell1-v1",
        data_item_name: "FinalSoHCapacityEstimate_CellBlock_Cell1",
        device_uuid: "s_194",
        sequence: 1,
        timestamp: "2019-10-09T09:48:44.689Z",
        value: 1
      },
      {
        channel: "soh2",
        data_item_id: "FinalSoHCapacityEstimate_CellBlock_Cell2-v1",
        data_item_name: "FinalSoHCapacityEstimate_CellBlock_Cell2",
        device_uuid: "s_194",
        sequence: 2,
        timestamp: "2019-10-09T09:48:44.689Z",
        value: 1
      }
    ])
  })
})
