import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../src/messageParser/channelParser/gridChannel"
import {CAN} from "../../fixtures/gridChannels/CAN"
import {getAttributesFormatter} from "../../../../src/messageParser/formatAttributes"

describe("Parses CAN", () => {
  let metricRegistry
  let appContext
  let log

  beforeEach(() => {
    process.env.VI_INPUT_TYPE = "ci"
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateCIEventFromMessageFn(appContext)
    const formatAttributes = getAttributesFormatter() // Note: Doing this as CAN attributes differs from attributes in other channels

    expect(
      createDataItemsFromMessage({message: {data: CAN.data, attributes: formatAttributes(CAN.attributes)}})
    ).to.eql([
      {
        channel: "can",
        data_item_id: "POD_CP_Volts-v1",
        data_item_name: "POD_CP_Volts",
        device_uuid: "DB_001f7b100e81",
        pod_id: "0xfff76",
        sequence: 39208,
        timestamp: "2020-09-02T22:36:46.523Z",
        value: 10.9956149784
      },
      {
        channel: "can",
        data_item_id: "POD_AtherVehicleConnected-v1",
        data_item_name: "POD_AtherVehicleConnected",
        device_uuid: "DB_001f7b100e81",
        pod_id: "0xfff76",
        sequence: 39208,
        timestamp: "2020-09-02T22:36:46.523Z",
        value: 0
      },
      {
        channel: "can",
        data_item_id: "POD_CP_State-v1",
        data_item_name: "POD_CP_State",
        device_uuid: "DB_001f7b100e81",
        pod_id: "0xfff76",
        sequence: 39208,
        timestamp: "2020-09-02T22:36:46.523Z",
        value: 65
      }
    ])
  })
})
