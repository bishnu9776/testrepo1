import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import {CAN_RAW} from "../../fixtures/bikeChannels/CAN_RAW"
import {getParsedCANRawMessageFn} from "../../utils/getParsedMessage"

describe("Parses CAN_RAW", () => {
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn()

  it("parses given messages", () => {
    const getParsedMessage = getParsedCANRawMessageFn("can_raw", "BMS-EOL5", 1)
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
