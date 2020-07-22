import {LOGS} from "../../fixtures/bikeChannels/LOGS"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {iso} from "../../utils/iso"

describe("Parses LOGS", () => {
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
  const getParsedMessageFn = (channel, device, canId) => (
    // eslint-disable-next-line camelcase
    data_item_id,
    // eslint-disable-next-line camelcase
    data_item_name,
    value,
    timestamp
  ) => ({
    data_item_id,
    data_item_name,
    timestamp: iso(timestamp),
    value,
    channel,
    device_uuid: device,
    ...(canId && {can_id: canId})
  })

  it("parses given messages", () => {
    const getParsedMessage = getParsedMessageFn("logs", "s_248")
    const parsedMessage = [
      getParsedMessage("message-v1", "message", "log message1", 0),
      getParsedMessage("message-v1", "message", "log message2", 1),
      getParsedMessage("message-v1", "message", "log message3", 2)
    ]
    expect(createDataItemsFromMessage({...LOGS, probe})).to.eql(parsedMessage)
  })
})
