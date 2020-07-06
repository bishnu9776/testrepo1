import {dedupDataItems} from "../../src/messageParser/dedupDataItems"
import {clearEnv} from "../utils"

describe("Helpers spec", () => {
  const metricRegistry = sinon.stub({
    updateStat: () => {}
  })

  const getDataItems = ({timestamp, value, dataItemName}) => ({
    timestamp,
    value,
    data_item_name: dataItemName
  })

  afterEach(() => {
    clearEnv()
  })

  describe("dedup data", () => {
    it("dedups events", () => {
      const dedupFn = dedupDataItems(metricRegistry)
      const dataItems = [
        getDataItems({timestamp: 1, value: 1, dataItemName: "a"}),
        getDataItems({timestamp: 2, value: 2, dataItemName: "a"}),
        getDataItems({timestamp: 3, value: 2, dataItemName: "a"}),
        getDataItems({timestamp: 2, value: 2, dataItemName: "b"}),
        getDataItems({timestamp: 3, value: 2, dataItemName: "b"})
      ]

      expect(dedupFn(dataItems)).to.eql([
        getDataItems({timestamp: 1, value: 1, dataItemName: "a"}),
        getDataItems({timestamp: 2, value: 2, dataItemName: "a"}),
        getDataItems({timestamp: 2, value: 2, dataItemName: "b"})
      ])
    })

    it("should not dedup selected dataitems", () => {
      process.env.VI_NON_DEDUP_DATAITEM_LIST = "a,c"
      const dedupFn = dedupDataItems(metricRegistry)
      const dataItems = [
        getDataItems({timestamp: 1, value: 1, dataItemName: "a"}),
        getDataItems({timestamp: 2, value: 2, dataItemName: "a"}),
        getDataItems({timestamp: 3, value: 2, dataItemName: "a"}),
        getDataItems({timestamp: 2, value: 2, dataItemName: "b"}),
        getDataItems({timestamp: 3, value: 2, dataItemName: "b"}),
        getDataItems({timestamp: 2, value: 3, dataItemName: "c"}),
        getDataItems({timestamp: 3, value: 3, dataItemName: "c"})
      ]

      expect(dedupFn(dataItems)).to.eql([
        getDataItems({timestamp: 1, value: 1, dataItemName: "a"}),
        getDataItems({timestamp: 2, value: 2, dataItemName: "a"}),
        getDataItems({timestamp: 3, value: 2, dataItemName: "a"}),
        getDataItems({timestamp: 2, value: 2, dataItemName: "b"}), // dedup
        getDataItems({timestamp: 2, value: 3, dataItemName: "c"}),
        getDataItems({timestamp: 3, value: 3, dataItemName: "c"})
      ])
    })
  })
})
