import {getMockLog} from "../../../../stubs/logger"
import {getMockMetricRegistry} from "../../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../../src/messageParser/channelParser/gridChannel"
import {NETWORK_DATA} from "../../../fixtures/gridChannels/preBigSink/NETWORK_DATA"

describe("Parses pre big sink NETWORK_DATA", () => {
  let metricRegistry
  let appContext
  let log

  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
    process.env.VI_GEN1_DATAITEM_ID_VERSION = "v1"
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateCIEventFromMessageFn(appContext)

    expect(createDataItemsFromMessage({message: NETWORK_DATA})).to.eql([
      {
        channel: "network_data",
        data_item_name: "nwk_iface_type",
        device_uuid: "DB_001f7b100e8f",
        sequence: 9015626,
        timestamp: "2020-07-20T09:24:53.000Z",
        value: "ETHERNET"
      },
      {
        channel: "network_data",
        data_item_name: "pod1_session_id",
        device_uuid: "DB_001f7b100e8f",
        sequence: 9015626,
        timestamp: "2020-07-20T09:24:53.000Z",
        value: 5397
      }
    ])
  })
})
