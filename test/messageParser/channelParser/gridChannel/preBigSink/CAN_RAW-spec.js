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
        can_id: "0x070",
        pod_id: "0xfffa4",
        data_item_name: "POD_S340_ChargerType",
        value: 2,
        device_uuid: "DB_001f7b10161e",
        sequence: 3788817,
        timestamp: "2020-10-22T09:46:56.341Z",
        channel: "can_raw"
      },
      {
        can_id: "0x070",
        pod_id: "0xfffa4",
        data_item_name: "POD_S340_McuChargingState",
        value: 32,
        sequence: 3788817,
        timestamp: "2020-10-22T09:46:56.341Z",
        device_uuid: "DB_001f7b10161e",
        channel: "can_raw"
      },
      {
        attributes: {
          device_id: "DB_001f7b10161e",
          channel: "can_raw",
          version: "v1"
        },
        channel: "can_raw",
        data_item_name: "can_raw",
        device_uuid: "DB_001f7b10161e",
        timestamp: "2020-10-22T09:46:56.341Z",
        value: {
          can_id: 112,
          data: "153122550539354627",
          db_id: "DB_001f7b10161e",
          global_seq: 79869961,
          pod_id: "0xfffa4",
          seq_num: 3788817,
          timestamp: 1603360016.341
        }
      }
    ])
  })
})
