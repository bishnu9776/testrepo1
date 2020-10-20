import {getMockLog} from "../../../../stubs/logger"
import {getMockMetricRegistry} from "../../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../../src/messageParser/channelParser/gridChannel"
import {SESSION_DATA} from "../../../fixtures/gridChannels/preBigSink/SESSION_DATA"
import {clearEnv} from "../../../../utils"

describe("Parses pre big sink SESSION_DATA", () => {
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
    const createDataItemsFromMessage = getCreateCIEventFromMessageFn(appContext)

    expect(createDataItemsFromMessage({message: SESSION_DATA})).to.eql([
      {
        auth_status: "NONE",
        channel: "session_data",
        charging_type: 2,
        data_item_id: "session-v1",
        data_item_name: "session",
        device_uuid: "DB_001f7b100569",
        end_reason: "VEHICLE_INTERRUPTED",
        end_time: 1585909207,
        energy_cousumed: 0,
        minutes_charged: 0,
        no_of_interruptions: 0,
        pod_id: "FFFC2",
        seconds_ac_charged: 0,
        seconds_dc_charged: 20,
        sequence: 169,
        session_id: 16573,
        start_time: 1585909185,
        timestamp: "2020-04-03T10:20:07.379Z",
        value: null,
        vehicle_id: "s_2384\n"
      }
    ])
  })
})
