import {getCreateBikeEventFromMessageFn} from "../../../../src/messageParser/channelParser/bikeChannel"
import {CAN_RAW} from "../../fixtures/bikeChannels/CAN_RAW"
import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {getParsedCANRawMessageFn} from "../../../utils/getParsedMessage"
import probe from "../../../fixtures/bike-probe.json"

describe("Parses CAN_RAW", () => {
  let metricRegistry
  let appContext
  let log
  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateBikeEventFromMessageFn(appContext, probe)
    const getParsedMessage = getParsedCANRawMessageFn("can_default", "BMS-EOL5", 1)
    expect(createDataItemsFromMessage({message: CAN_RAW})).to.eql([
      getParsedMessage({
        can_id: 306,
        data: "-2621409860442463330",
        global_seq: "49719812",
        seq_num: 1509075,
        timestamp: 1
      }),
      getParsedMessage({
        can_id: 305,
        data: "72131264154501120",
        global_seq: "49719813",
        seq_num: 1509076,
        timestamp: 1
      })
    ])
  })
})
