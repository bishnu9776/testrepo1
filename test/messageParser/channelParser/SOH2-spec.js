import {SOH2} from "../../fixtures/bikeChannels/SOH2"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {getMockLog} from "../../stubs/logger"
import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"

describe("Parses SOH2", () => {
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
    expect(createDataItemsFromMessage({message: SOH2, probe})).to.eql([
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
