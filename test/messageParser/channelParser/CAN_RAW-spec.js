import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import {CAN_RAW} from "../../fixtures/bikeChannels/CAN_RAW"
import {getParserCANRAWMessageFn} from "../../utils/getParsedMessage"

describe("Parses CAN_RAW", () => {
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn()

  it("parses given messages", () => {
    const getParsedMessage = getParserCANRAWMessageFn("BMS-EOL5", 1, "can_raw")
    expect(createDataItemsFromMessage({...CAN_RAW})).to.eql([
      getParsedMessage({
        can_id: 306,
        data: "-2621409860442463330",
        global_seq: "49719812",
        seq_num: 1509075,
        timestamp: 1
      }),
      getParsedMessage({
        can_id: 305,
        data: "72131264154501120",
        global_seq: "49719813",
        seq_num: 1509076,
        timestamp: 1
      })
    ])
  })
})
