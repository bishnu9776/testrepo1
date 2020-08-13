import {getValues} from "../../../../src/messageParser/channelParser/utils/getValues"
import {getMockLog} from "../../../stubs/logger"

describe("getValues spec", () => {
  describe("probe is not properly defined", () => {
    const probe = {
      b: {
        data_item_name: "b",
        data_item_type: "B"
      },
      c: {
        data_item_name: "c",
        data_item_type: "C",
        values_schema: "STRING"
      }
    }
    const event = {
      a: 1,
      b: 2,
      c: "3"
    }
    it("should take schema as UNKNOWN when probe is not present", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "a"})).to.be.equal("1")
      expect(log.warn).to.have.been.calledWith("Data item: a is not present in the probe.")
    })

    it("should take schema as UNKNOWN when probe is doesn't have values_schema", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "b"})).to.be.equal("2")
    })

    it("should take values_keys as default when it is not defined in the probe", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "c"})).to.be.equal("3")
    })
  })

  describe("when values_schema is defined", () => {
    const probe = {
      a: {
        data_item_name: "a",
        data_item_type: "A",
        values_schema: "INT"
      },
      b: {
        data_item_name: "b",
        data_item_type: "B",
        values_schema: "DOUBLE"
      },
      c: {
        data_item_name: "c",
        data_item_type: "C",
        values_schema: "STRING"
      },
      d: {
        synthetic: true,
        data_item_name: "d",
        data_item_type: "D",
        values_schema: "SPATIAL",
        values_keys: [
          {key: "a", value: "a"},
          {key: "b", value: "b"},
          {key: "c", value: "c"}
        ]
      }
    }
    const event = {
      a: 1,
      b: 2.2,
      c: "3"
    }
    it("should return value as is if schema is INT ", () => {
      expect(getValues({event, probe, dataItemName: "a"})).to.be.equal(1)
    })
  })
})
