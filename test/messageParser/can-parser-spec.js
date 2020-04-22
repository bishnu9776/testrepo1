import {canParser} from "../../src/messageParser/channelParser/can-parser"
import canParserJSON from "../fixtures/bike-channels/can-parser.json"

describe("can parser", () => {
  const input = {
    attributes: {
      channel: "can",
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

  it("should parse can data", () => {
    const response = canParser(canParserJSON)(input)
    // console.log(JSON.stringify(response, null, 2))
  })
})
