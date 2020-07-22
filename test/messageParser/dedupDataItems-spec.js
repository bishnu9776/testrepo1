import {dedupDataItems} from "../../src/messageParser/dedupDataItems"
import {clearEnv} from "../utils"
import {getMockMetricRegistry} from "../stubs/getMockMetricRegistry"
import {clearStub} from "../stubs/clearStub"

describe("Helpers spec", () => {
  let metricRegistry

  beforeEach(() => {
    metricRegistry = getMockMetricRegistry()
  })

  const getDataItems = ({timestamp, value, dataItemName}) => ({
    timestamp,
    value,
    data_item_name: dataItemName
  })

  afterEach(() => {
    clearEnv()
    clearStub()
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
      process.env.VI_DATAITEM_LIST_TO_NOT_DEDUP = "a,c"
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
