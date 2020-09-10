import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {getCreateCIEventFromMessageFn} from "../../../../src/messageParser/channelParser/gridChannel"
import {DB_DATA} from "../../fixtures/gridChannels/DB_DATA"

describe("Parses DB_DATA", () => {
  let metricRegistry
  let appContext
  let log

  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateCIEventFromMessageFn(appContext)

    expect(createDataItemsFromMessage({message: DB_DATA})).to.eql([
      {
        channel: "db_data",
        data_item_id: "temp_sensor1-v1_5",
        data_item_name: "temp_sensor1",
        device_uuid: "DB_D81910297370017",
        sequence: 17176736,
        timestamp: "2020-09-09T07:35:39.000Z",
        value: 2.9
      },
      {
        channel: "db_data",
        data_item_id: "temp_sensor2-v1_5",
        data_item_name: "temp_sensor2",
        device_uuid: "DB_D81910297370017",
        sequence: 17176736,
        timestamp: "2020-09-09T07:35:39.000Z",
        value: 31.1
      },
      {
        channel: "db_data",
        data_item_id: "temp_sensor3-v1_5",
        data_item_name: "temp_sensor3",
        device_uuid: "DB_D81910297370017",
        sequence: 17176736,
        timestamp: "2020-09-09T07:35:39.000Z",
        value: 31.2
      },
      {
        channel: "db_data",
        data_item_id: "temp_sensor4-v1_5",
        data_item_name: "temp_sensor4",
        device_uuid: "DB_D81910297370017",
        sequence: 17176736,
        timestamp: "2020-09-09T07:35:39.000Z",
        value: 0
      },
      {
        channel: "db_data",
        data_item_id: "temp_sensor5-v1_5",
        data_item_name: "temp_sensor5",
        device_uuid: "DB_D81910297370017",
        sequence: 17176736,
        timestamp: "2020-09-09T07:35:39.000Z",
        value: 0
      }
    ])
  })
})
