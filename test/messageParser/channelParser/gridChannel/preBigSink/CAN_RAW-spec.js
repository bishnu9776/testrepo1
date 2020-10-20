import {getMockLog} from "../../../../stubs/logger"
import {getMockMetricRegistry} from "../../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../../src/messageParser/channelParser/gridChannel"
import {CAN_RAW} from "../../../fixtures/gridChannels/preBigSink/CAN_RAW"
import {clearEnv} from "../../../../utils"

const {env} = process

describe("Parses grid CAN_RAW", () => {
  let metricRegistry
  let appContext
  let log

  beforeEach(() => {
    env.VI_INPUT_TYPE = "ci"
    env.VI_GEN1_DATAITEM_ID_VERSION = "v1"
    env.VI_GRID_CAN_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/gridCanDecoderConfig.json"
    env.VI_GRID_CAN_MESSAGE_BYTE_LENGTH = "16"
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
  })

  afterEach(() => {
    clearEnv()
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateCIEventFromMessageFn(appContext)

    expect(createDataItemsFromMessage({message: CAN_RAW})).to.eql([
      {
        can_id: "0x05e",
        channel: "can_raw",
        data_item_id: "POD_AC_Voltage-v1",
        data_item_name: "POD_AC_Voltage",
        device_uuid: "DB_001f7b100e99",
        sequence: 82121,
        timestamp: "2020-04-06T16:12:46.960Z",
        value: 241.094
      },
      {
        attributes: {
          bike_id: "DB_001f7b100e99",
          channel: "can_raw",
          version: "v1"
        },
        channel: "can_raw",
        data_item_name: "can_raw",
        device_uuid: "DB_001f7b100e99",
        timestamp: "2020-04-06T16:12:46.960Z",
        value: {
          can_id: "0x05e",
          data: "91000000c6ad0300",
          db_id: "DB_001f7b100e91",
          global_seq: 49767849,
          pod_id: "0xfffe8",
          seq_num: 82121,
          timestamp: 1586189566.96
        }
      }
    ])
  })
})
