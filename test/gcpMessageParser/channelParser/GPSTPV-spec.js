import {GPSTPV} from "../mockChannelData/GPSTPV"
import {parseChannelMessage} from "../../../src/gcpMessageParser/channelParser"
import probe from "../../mocks/probe.json"

describe("Parses GPSTPV", () => {
  it("parses given messages", () => {
    expect(parseChannelMessage({...GPSTPV, probe})).to.eql([
      {
        bigsink_timestamp: "2019-10-05T18:27:15.892Z",
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
        }
      },
      {
        bigsink_timestamp: "2019-10-05T18:27:15.892Z",
        channel: "gps_tpv",
        data_item_id: "mode-v1",
        data_item_name: "mode",
        device_uuid: "s_248",
        sequence: 290929,
        timestamp: "2019-10-05T18:27:04.164Z",
        value: 3
      },
      {
        bigsink_timestamp: "2019-10-05T18:27:15.892Z",
        channel: "gps_tpv",
        data_item_id: "lat_deg-v1",
        data_item_name: "lat_deg",
        device_uuid: "s_248",
        sequence: 290929,
        timestamp: "2019-10-05T18:27:04.164Z",
        value: 12.910605
      },
      {
        bigsink_timestamp: "2019-10-05T18:27:15.892Z",
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
