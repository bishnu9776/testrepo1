import {GPSTPV} from "../../fixtures/bikeChannels/GPSTPV"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"

describe("Parses GPSTPV", () => {
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn()

  it("parses given messages", () => {
    expect(createDataItemsFromMessage({...GPSTPV, probe})).to.eql([
      {
        data_item_id: "location-v1",
        data_item_name: "location",
        data_item_type: "LOCATION",
        device_uuid: "s_248",
        mode: 3,
        sequence: 290929,
        timestamp: "2019-10-05T18:27:04.164Z",
        value: {
          lat: 12.910605,
          lon: 77.60284
        },
        channel: "gps_tpv"
      },
      {
        channel: "gps_tpv",
        data_item_id: "mode-v1",
        data_item_name: "mode",
        device_uuid: "s_248",
        sequence: 290929,
        timestamp: "2019-10-05T18:27:04.164Z",
        value: 3
      },
      {
        channel: "gps_tpv",
        data_item_id: "lat_deg-v1",
        data_item_name: "lat_deg",
        device_uuid: "s_248",
        sequence: 290929,
        timestamp: "2019-10-05T18:27:04.164Z",
        value: 12.910605
      },
      {
        channel: "gps_tpv",
        data_item_id: "lon_deg-v1",
        data_item_name: "lon_deg",
        device_uuid: "s_248",
        sequence: 290929,
        timestamp: "2019-10-05T18:27:04.164Z",
        value: 77.60284
      }
    ])
  })
})
