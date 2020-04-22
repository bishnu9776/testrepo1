import {sortWith, prop, ascend} from "ramda"
import {canParser} from "../../src/messageParser/channelParser/can-parser"
import canParserJSON from "../fixtures/bike-channels/can-parser.json"

describe("can parser", () => {
  const sortBasedOnKey = arr => sortWith([ascend(prop(["key"]))])(arr)
  const assertion = (response, expected) => expect(sortBasedOnKey(response)).to.eql(sortBasedOnKey(expected))

  it("should parse can data for can_mcu", () => {
    const input = {
      attributes: {
        channel: "can_mcu/v1_0_0",
        bike_id: "s_2404",
        version: "v1"
      },
      data: [
        {
          parsed: [
            {
              can_id: "0x100",
              timestamp: 1570299991.477,
              seq_num: 347731,
              key: "MCU_SOC",
              value: 0,
              bigsink_timestamp: "2019-10-05T18:27:19.775",
              bike_id: "s_2404"
            },
            {
              can_id: "0x100",
              timestamp: 1570299991.477,
              seq_num: 347731,
              key: "MCU_CHARGER_TYPE",
              value: 0,
              bigsink_timestamp: "2019-10-05T18:27:19.775",
              bike_id: "s_2404"
            }
          ],
          canRaw: {
            can_id: "0x100",
            data: "0101000001040002",
            timestamp: 1570299991.477,
            seq_num: 347731,
            bigsink_timestamp: "2019-10-05T18:27:19.775",
            bike_id: "s_2404"
          }
        },
        {
          parsed: [
            {
              can_id: "0x100",
              timestamp: 1570299991.978,
              seq_num: 347733,
              key: "MCU_SOC",
              value: 0,
              bigsink_timestamp: "2019-10-05T18:27:19.775",
              bike_id: "s_2404"
            },
            {
              can_id: "0x100",
              timestamp: 1570299991.978,
              seq_num: 347733,
              key: "MCU_CHARGER_TYPE",
              value: 0,
              bigsink_timestamp: "2019-10-05T18:27:19.775",
              bike_id: "s_2404"
            }
          ],
          canRaw: {
            can_id: "0x100",
            data: "0101000001040002",
            timestamp: 1570299991.978,
            seq_num: 347733,
            bigsink_timestamp: "2019-10-05T18:27:19.775",
            bike_id: "s_2404"
          }
        }
      ]
    }
    const parsedData = canParser(canParserJSON)(input)
    const expectedOutput = input.data[0].parsed.concat(input.data[1].parsed)
    assertion(parsedData, expectedOutput)
  })

  it("should parse can data for can_bms", () => {
    const input = {
      attributes: {
        channel: "can_bms/e55",
        bike_id: "BEAGLE-ESS-4",
        version: "v1"
      },
      data: [
        {
          parsed: [
            {
              can_id: "0x158",
              timestamp: 1587334363.055,
              seq_num: 543232814,
              global_seq: 741485778,
              bigsink_timestamp: "2020-04-19T22:12:44.108",
              bike_id: "BEAGLE-ESS-4",
              key: "BMS_2_Aux_Temp2",
              value: 29.67
            },
            {
              can_id: "0x158",
              timestamp: 1587334363.055,
              seq_num: 543232814,
              global_seq: 741485778,
              bigsink_timestamp: "2020-04-19T22:12:44.108",
              bike_id: "BEAGLE-ESS-4",
              key: "BMS_2_Aux_Temp1",
              value: 29.57
            },
            {
              can_id: "0x158",
              timestamp: 1587334363.055,
              seq_num: 543232814,
              global_seq: 741485778,
              bigsink_timestamp: "2020-04-19T22:12:44.108",
              bike_id: "BEAGLE-ESS-4",
              key: "BMS_2_Aux_Temp4",
              value: 29.21
            },
            {
              can_id: "0x158",
              timestamp: 1587334363.055,
              seq_num: 543232814,
              global_seq: 741485778,
              bigsink_timestamp: "2020-04-19T22:12:44.108",
              bike_id: "BEAGLE-ESS-4",
              key: "BMS_2_Aux_Temp3",
              value: 29.06
            }
          ],
          parsedWide: {
            can_bms: [
              {
                can_id: "0x158",
                timestamp: 1587334363.055,
                seq_num: 543232814,
                global_seq: 741485778,
                bigsink_timestamp: "2020-04-19T22:12:44.108",
                bike_id: "BEAGLE-ESS-4",
                BMS_2_Aux_Temp2: 29.67,
                BMS_2_Aux_Temp1: 29.57,
                BMS_2_Aux_Temp4: 29.21,
                BMS_2_Aux_Temp3: 29.06
              }
            ]
          },
          canRaw: {
            can_id: "0x158",
            data: "8d0b970b5a0b690b",
            timestamp: 1587334363.055,
            seq_num: 543232814,
            global_seq: 741485778,
            bigsink_timestamp: "2020-04-19T22:12:44.108",
            bike_id: "BEAGLE-ESS-4"
          }
        }
      ]
    }
    const parsedData = canParser(canParserJSON)(input)
    assertion(parsedData, input.data[0].parsed)
  })
})
