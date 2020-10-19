import {getMockLog} from "../../../../stubs/logger"
import {getMockMetricRegistry} from "../../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../../src/messageParser/channelParser/gridChannel"
import {CAN_RAW} from "../../../fixtures/gridChannels/preBigSink/CAN_RAW"
import {clearEnv} from "../../../../utils"

describe("Parses grid CAN_RAW", () => {
  let metricRegistry
  let appContext
  let log

  beforeEach(() => {
    process.env.VI_INPUT_TYPE = "ci"
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
    process.env.VI_GEN1_DATAITEM_ID_VERSION = "v1"
  })

  afterEach(() => {
    clearEnv()
  })

  it.skip("parses given messages", () => {
    const createDataItemsFromMessage = getCreateCIEventFromMessageFn(appContext)

    expect(createDataItemsFromMessage({message: CAN_RAW})).to.eql([])
  })
})
