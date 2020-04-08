import {createDataItemsFromMessage} from "../../../src/messageParser/channelParser"
import {CAN} from "../../fixtures/channel/CAN"
import probe from "../../fixtures/probe.json"

describe("Parses CAN", () => {
  it("parses given messages", () => {
    expect(createDataItemsFromMessage({...CAN, probe})).to.eql([
      {
        bigsink_timestamp: "2019-10-05T18:27:19.775Z",
        channel: "can",
        data_item_id: "MCU_SOC-v1",
        data_item_name: "MCU_SOC",
        device_uuid: "s_2404",
        sequence: 347731,
        timestamp: "2019-10-05T18:26:31.477Z",
        value: 0
      },
      {
        bigsink_timestamp: "2019-10-05T18:27:19.775Z",
        channel: "can",
        data_item_id: "MCU_CHARGER_TYPE-v1",
        data_item_name: "MCU_CHARGER_TYPE",
        device_uuid: "s_2404",
        sequence: 347731,
        timestamp: "2019-10-05T18:26:31.477Z",
        value: 0
      },
      {
        bigsink_timestamp: "2019-10-05T18:27:19.775Z",
        channel: "can",
        data_item_id: "MCU_SOC-v1",
        data_item_name: "MCU_SOC",
        device_uuid: "s_2404",
        sequence: 347733,
        timestamp: "2019-10-05T18:26:31.978Z",
        value: 0
      },
      {
        bigsink_timestamp: "2019-10-05T18:27:19.775Z",
        channel: "can",
        data_item_id: "MCU_CHARGER_TYPE-v1",
        data_item_name: "MCU_CHARGER_TYPE",
        device_uuid: "s_2404",
        sequence: 347733,
        timestamp: "2019-10-05T18:26:31.978Z",
        value: 0
      }
    ])
  })
})
