/* eslint-disable camelcase */
import {LOGS} from "../../fixtures/bikeChannels/LOGS"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {iso} from "../../utils/iso"
import {getMockLog} from "../../stubs/logger"
import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"

describe("Parses LOGS", () => {
  const getParsedMessageFn = (channel, device) => (data_item_id, data_item_name, value, timestamp, source) => ({
    data_item_id,
    data_item_name,
    timestamp: iso(timestamp),
    value: {log: {message: value, source}},
    channel,
    device_uuid: device
  })

  let metricRegistry
  let appContext
  let log
  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateDataItemFromMessageFn(appContext, probe)
    const getParsedMessage = getParsedMessageFn("logs", "s_248")
    const parsedMessage = [
      getParsedMessage("message-v1", "message", "log message1", 0, "vcu-s340-app"),
      getParsedMessage("message-v1", "message", "log message2", 1, "vcu-s340-app"),
      getParsedMessage("message-v1", "message", "log message3", 2, "vcu-s340-app")
    ]
    expect(createDataItemsFromMessage({message: LOGS})).to.eql(parsedMessage)
  })
})
