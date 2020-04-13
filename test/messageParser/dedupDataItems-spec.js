import {dedupDataItems} from "../../src/messageParser/dedupDataItems"

describe("Helpers spec", () => {
  const metricRegistry = sinon.stub({
    updateStat: () => {}
  })

  const dedupFn = dedupDataItems(metricRegistry)

  describe("dedup data", () => {
    it("dedups events", () => {
      const dataItems = [
        {
          timestamp: 1,
          value: 1,
          data_item_name: "a"
        },
        {
          timestamp: 2,
          value: 2,
          data_item_name: "a"
        },
        {
          timestamp: 3,
          value: 2,
          data_item_name: "a"
        },
        {
          timestamp: 2,
          value: 2,
          data_item_name: "b"
        },
        {
          timestamp: 3,
          value: 2,
          data_item_name: "b"
        }
      ]

      expect(dedupFn(dataItems)).to.eql([
        {
          data_item_name: "a",
          timestamp: 1,
          value: 1
        },
        {
          data_item_name: "a",
          timestamp: 2,
          value: 2
        },
        {
          data_item_name: "b",
          timestamp: 2,
          value: 2
        }
      ])
    })
  })
})
