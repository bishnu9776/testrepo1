import {GPSTPV} from "../../fixtures/bikeChannels/GPSTPV"
import {getCreateBikeEventFromMessageFn} from "../../../../src/messageParser/channelParser/bikeChannel"
import probe from "../../../fixtures/bike-probe.json"
import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {clearEnv} from "../../../utils"

describe("Parses GPSTPV", () => {
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

    expect(createDataItemsFromMessage({message: GPSTPV})).to.eql([
      {
        data_item_name: "location",
        data_item_type: "LOCATION",
        device_uuid: "s_248",
        mode: 3,
        sequence: 290929,
        timestamp: "2019-10-05T18:27:04.164Z",
        value: {
          lat: 12.910605,
          lon: 77.60284
        },
        channel: "gps_tpv"
      },
      {
        channel: "gps_tpv",
        data_item_name: "mode",
        device_uuid: "s_248",
        sequence: 290929,
        timestamp: "2019-10-05T18:27:04.164Z",
        value: 3
      },
      {
        channel: "gps_tpv",
        data_item_name: "lat_deg",
        device_uuid: "s_248",
        sequence: 290929,
        timestamp: "2019-10-05T18:27:04.164Z",
        value: 12.910605
      },
      {
        channel: "gps_tpv",
        data_item_name: "lon_deg",
        device_uuid: "s_248",
        sequence: 290929,
        timestamp: "2019-10-05T18:27:04.164Z",
        value: 77.60284
      }
    ])
  })
})
