import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../src/messageParser/channelParser/gridChannel"
import {NETWORK_DATA} from "../../fixtures/gridChannels/NETWORK_DATA"

describe("Parses NETWORK_DATA", () => {
  let metricRegistry
  let appContext
  let log

  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
    process.env.VI_GEN1_DATAITEM_ID_VERSION = "v1"
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateCIEventFromMessageFn(appContext)

    expect(createDataItemsFromMessage({message: NETWORK_DATA})).to.eql([
      {
        device_uuid: "DB_001f7b100e8f",
        data_item_name: "nwk_iface_type",
        timestamp: "2020-07-20T09:24:53.000Z",
        value: "ETHERNET",
        channel: "network_data",
        sequence: 9015626
      },
      {
        device_uuid: "DB_001f7b100e8f",
        data_item_name: "pod1_session_id",
        timestamp: "2020-07-20T09:24:53.000Z",
        value: 5397,
        channel: "network_data",
        sequence: 9015626
      },
      {
        device_uuid: "DB_001f7b100e8f",
        data_item_name: "ureg",
        timestamp: "2020-09-09T09:57:16.065Z",
        value: 6,
        channel: "network_data",
        sequence: 23533
      },
      {
        device_uuid: "DB_001f7b100e8f",
        data_item_name: "signal_strength",
        timestamp: "2020-09-09T09:57:16.065Z",
        value: 19,
        channel: "network_data",
        sequence: 23533
      },
      {
        device_uuid: "DB_001f7b100e8f",
        data_item_name: "service_provider",
        timestamp: "2020-09-09T09:57:16.065Z",
        value: "BSNL MOBILE",
        channel: "network_data",
        sequence: 23533
      },
      {
        device_uuid: "DB_001f7b100e8f",
        data_item_name: "sim_status",
        timestamp: "2020-09-09T09:57:16.065Z",
        value: 1,
        channel: "network_data",
        sequence: 23533
      },
      {
        device_uuid: "DB_001f7b100e8f",
        data_item_name: "nwk_iface_type",
        timestamp: "2020-09-09T09:57:16.065Z",
        value: "ppp0",
        channel: "network_data",
        sequence: 23533
      },
      {
        device_uuid: "DB_001f7b100e8f",
        data_item_name: "ppp_ip",
        timestamp: "2020-09-09T09:57:16.065Z",
        value: "100.95.67.131",
        channel: "network_data",
        sequence: 23533
      },
      {
        device_uuid: "DB_001f7b100e8f",
        data_item_name: "eth_ip",
        timestamp: "2020-09-09T09:57:16.065Z",
        value: "",
        channel: "network_data",
        sequence: 23533
      },
      {
        device_uuid: "DB_001f7b100e8f",
        data_item_name: "data_usage",
        timestamp: "2020-09-09T09:57:16.065Z",
        value: 0,
        channel: "network_data",
        sequence: 23533
      },
      {
        device_uuid: "DB_001f7b100e8f",
        data_item_name: "pod1_session_id",
        timestamp: "2020-09-09T09:57:16.065Z",
        value: 0,
        channel: "network_data",
        sequence: 23533
      },
      {
        device_uuid: "DB_001f7b100e8f",
        data_item_name: "reset_type",
        timestamp: "2020-09-09T09:57:16.065Z",
        value: 0,
        channel: "network_data",
        sequence: 23533
      }
    ])
  })
})
