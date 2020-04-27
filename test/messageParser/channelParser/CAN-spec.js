import {createDataItemsFromMessage} from "../../../src/messageParser/channelParser"
import {CAN, canBms} from "../../fixtures/bike-channels/CAN"
import probe from "../../fixtures/probe.json"

describe("Parses CAN", () => {
  const {env} = process

  beforeEach("Setup envs", () => {
    env.VI_CAN_DECODER_CONFIG_PATH = "../../../test/fixtures/bike-channels/can-parser-config.json"
    env.VI_CAN_VERSIION_COMPONENT_CONFIG_PATH = "../../../test/fixtures/bike-channels/component-version-config.json"
  })

  afterEach("Clear setup", () => {
    delete env.VI_SHOULD_DECODE_CAN_DATA
    delete env.VI_CAN_DECODER_CONFIG_PATH
    delete env.VI_CAN_VERSIION_COMPONENT_CONFIG_PATH
  })

  it("VI_SHOULD_DECODE_CAN_DATA: false, parses given messages without decoding", () => {
    env.VI_SHOULD_DECODE_CAN_DATA = false
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

  describe("VI_SHOULD_DECODE_CAN_DATA: true, should decode  and parse the message", () => {
    it("when channel is can", () => {
      env.VI_SHOULD_DECODE_CAN_DATA = true
      const messageWithoutCanParsed = {
        attributes: CAN.attributes,
        data: [{canRaw: CAN.data[0].canRaw}, {canRaw: CAN.data[1].canRaw}]
      }
      expect(createDataItemsFromMessage({...messageWithoutCanParsed, probe})).to.eql([
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

    it("when channel contains component name and version", () => {
      env.VI_SHOULD_DECODE_CAN_DATA = true
      const parsedData = [
        {
          bigsink_timestamp: "2020-04-19T22:12:44.108Z",
          channel: "can_bms/e55",
          data_item_id: "BMS_2_Aux_Temp1-v1",
          data_item_name: "BMS_2_Aux_Temp1",
          device_uuid: "BEAGLE-ESS-4",
          sequence: 543232814,
          timestamp: "2020-04-19T22:12:43.055Z",
          value: 29.57
        },
        {
          bigsink_timestamp: "2020-04-19T22:12:44.108Z",
          channel: "can_bms/e55",
          data_item_id: "BMS_2_Aux_Temp2-v1",
          data_item_name: "BMS_2_Aux_Temp2",
          device_uuid: "BEAGLE-ESS-4",
          sequence: 543232814,
          timestamp: "2020-04-19T22:12:43.055Z",
          value: 29.67
        },
        {
          bigsink_timestamp: "2020-04-19T22:12:44.108Z",
          channel: "can_bms/e55",
          data_item_id: "BMS_2_Aux_Temp3-v1",
          data_item_name: "BMS_2_Aux_Temp3",
          device_uuid: "BEAGLE-ESS-4",
          sequence: 543232814,
          timestamp: "2020-04-19T22:12:43.055Z",
          value: 29.06
        },
        {
          bigsink_timestamp: "2020-04-19T22:12:44.108Z",
          channel: "can_bms/e55",
          data_item_id: "BMS_2_Aux_Temp4-v1",
          data_item_name: "BMS_2_Aux_Temp4",
          device_uuid: "BEAGLE-ESS-4",
          sequence: 543232814,
          timestamp: "2020-04-19T22:12:43.055Z",
          value: 29.21
        }
      ]
      const messageWithoutCanParsed = {attributes: canBms.attributes, data: [{canRaw: canBms.data[0].canRaw}]}
      expect(createDataItemsFromMessage({...messageWithoutCanParsed, probe})).to.eql(parsedData)
    })
  })
})
