import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import {CAN_RAW} from "../../fixtures/bikeChannels/CAN_RAW"

describe("Parses CAN_RAW", () => {
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn()

  it("parses given messages", () => {
    expect(createDataItemsFromMessage({...CAN_RAW})).to.eql([
      {
        attributes: {
          bike_id: "BMS-EOL5",
          channel: "can_raw",
          version: "v1"
        },
        value: {
          can_id: 306,
          data: "-2621409860442463330",
          global_seq: "49719812",
          seq_num: 1509075,
          timestamp: 1595321899.501
        },
        data_item_name: "can_raw",
        device_uuid: "BMS-EOL5",
        timestamp: "2020-07-21T08:58:19.501Z"
      },
      {
        attributes: {
          bike_id: "BMS-EOL5",
          channel: "can_raw",
          version: "v1"
        },
        value: {
          can_id: 305,
          data: "72131264154501120",
          global_seq: "49719813",
          seq_num: 1509076,
          timestamp: 1595321899.501
        },
        data_item_name: "can_raw",
        device_uuid: "BMS-EOL5",
        timestamp: "2020-07-21T08:58:19.501Z"
      }
    ])
  })
})
