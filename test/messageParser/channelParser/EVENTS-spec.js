import {createDataItemsFromMessage} from "../../../src/messageParser/channelParser"
import {EVENTS} from "../../fixtures/bike-channels/EVENTS"
import probe from "../../fixtures/probe.json"

describe("Parses EVENTS", () => {
  it("parses given messages", () => {
    expect(createDataItemsFromMessage({...EVENTS, probe})).to.eql([
      {
        bigsink_timestamp: "2019-10-06T05:22:38.848Z",
        channel: "events",
        data_item_id: "beta_motorMode2-v1",
        data_item_name: "beta_motorMode2",
        device_uuid: "s_248",
        sequence: 74092,
        timestamp: "2019-10-06T05:11:05.313Z",
        value: "2.443957"
      },
      {
        bigsink_timestamp: "2019-10-06T05:22:38.848Z",
        channel: "events",
        data_item_id: "intercept_motorMode2-v1",
        data_item_name: "intercept_motorMode2",
        device_uuid: "s_248",
        sequence: 74093,
        timestamp: "2019-10-06T05:11:05.314Z",
        value: "7.5228567"
      }
    ])
  })
})
