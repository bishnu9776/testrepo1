import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../src/messageParser/channelParser/gridChannel"
import {CAN} from "../../fixtures/gridChannels/CAN"
import {clearEnv} from "../../../utils"

describe("Parses grid CAN", () => {
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

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateCIEventFromMessageFn(appContext)
    expect(createDataItemsFromMessage({message: {data: CAN.data, attributes: CAN.attributes}})).to.eql([
      {
        channel: "can",
        data_item_id: "POD_AC_Voltage-v1",
        data_item_name: "POD_AC_Voltage",
        device_uuid: "DB_001f7b100e91",
        pod_id: "0xfffe8",
        sequence: 82121,
        timestamp: "2020-04-06T16:12:46.960Z",
        value: 241.094
      }
    ])
  })
})
