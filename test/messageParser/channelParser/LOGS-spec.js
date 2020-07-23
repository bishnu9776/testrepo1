import {LOGS} from "../../fixtures/bikeChannels/LOGS"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {getParsedMessageFn} from "../../utils/getParsedMessage"

describe("Parses LOGS", () => {
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn()
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
