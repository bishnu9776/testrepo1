import {getMockLog} from "../../../../stubs/logger"
import {getMockMetricRegistry} from "../../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../../src/messageParser/channelParser/gridChannel"
import {clearEnv} from "../../../../utils"
import {LOGS} from "../../../fixtures/gridChannels/preBigSink/LOGS"

describe("Parses pre big sink LOGS", () => {
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

    expect(createDataItemsFromMessage({message: LOGS})).to.eql([
      {
        channel: "logs",
        data_item_id: "message-v1",
        data_item_name: "message",
        device_uuid: "DB_001f7b101618",
        timestamp: "2020-10-18T20:55:45.808Z",
        value: {
          message: "salt-minion.service: Service hold-off time over, scheduling restart.",
          source: "systemd"
        }
      },
      {
        channel: "logs",
        data_item_id: "message-v1",
        data_item_name: "message",
        device_uuid: "DB_001f7b101618",
        timestamp: "2020-10-18T20:55:45.820Z",
        value: {
          message: "Stopped The Salt Minion.",
          source: "systemd"
        }
      }
    ])
  })
})
