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
      },
      value_keys_without_schema: {
        data_item_name: "c",
        data_item_type: "C",
        values_keys: [{key: "a", value: "b"}]
      }
    }
    const event = {
      a: 1,
      b: 2,
      c: "3",
      d: null
    }
    it("should take schema as UNKNOWN when probe is not present", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "a"})).to.be.equal("1")
      expect(log.warn).to.have.been.calledWith("Data item: a is not present in the probe.")
    })

    it("should take schema as UNKNOWN when probe doesn't have values_schema", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "b"})).to.be.equal("2")
    })

    it("should take values_keys as default when it is not defined in the probe", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "c"})).to.be.equal("3")
    })

    it("should return string of values when values_keys is present and schema is not", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "value_keys_without_schema"})).to.be.equal("2")
    })
  })

  describe("when values_schema is defined", () => {
    const probe = {
      a: {
        data_item_name: "a",
        data_item_type: "A",
        values_schema: "INT"
      },
      double: {
        data_item_name: "double",
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
          {key: "b", value: "double"},
          {key: "c", value: "c"}
        ]
      },
      location: {
        synthetic: true,
        data_item_name: "location",
        data_item_type: "LOC",
        values_schema: "LOCATION",
        values_keys: [
          {key: "a", value: "a"},
          {key: "b", value: "double"}
        ]
      },
      f: {
        synthetic: true,
        data_item_name: "f",
        data_item_type: "F",
        values_schema: "LOCATION",
        values_keys: [
          {key: "a", value: "a"},
          {key: "b", value: "lon"}
        ]
      },
      json_schema_item: {
        synthetic: true,
        data_item_name: "g",
        data_item_type: "G",
        values_schema: "JSON",
        values_keys: [
          {key: "a", value: "a"},
          {key: "b", value: "double"}
        ]
      }
    }
    const event = {
      a: 1,
      double: 2.2,
      c: "3",
      probeAbsent: null
    }

    it("should return value as is if schema is INT ", () => {
      expect(getValues({event, probe, dataItemName: "a"})).to.be.equal(1)
    })

    it("should return value as is if schema is DOUBLE ", () => {
      expect(getValues({event, probe, dataItemName: "double"})).to.be.equal(2.2)
    })

    it("should return value as is if schema is STRING ", () => {
      expect(getValues({event, probe, dataItemName: "c"})).to.be.equal("3")
    })

    it("should return value as is if schema is SPATIAL ", () => {
      const val = getValues({
        event,
        probe,
        dataItemName: "d"
      })
      expect(val).to.deep.equal({
        a: 1,
        b: 2.2,
        c: "3"
      })
    })

    it("should return value as is if schema is LOCATION ", () => {
      const val = getValues({
        event,
        probe,
        dataItemName: "location"
      })
      expect(val).to.deep.equal({
        a: 1,
        b: 2.2
      })
    })

    it("should return value based on value keys when schema is location and return null for key not present", () => {
      const val = getValues({
        event,
        probe,
        dataItemName: "f"
      })
      expect(val).to.deep.equal({
        a: 1,
        b: null
      })
    })

    it("should return value if schema is JSON in probe", () => {
      const val = getValues({
        event,
        probe,
        dataItemName: "json_schema_item"
      })
      expect(val).to.deep.equal({
        json_schema_item: {
          a: 1,
          b: 2.2
        }
      })
    })
    it("should return null if schema is JSON and value is null", () => {
      const val = getValues({
        event: {},
        probe,
        dataItemName: "json_schema_item"
      })
      expect(val).to.eql(null)
    })
    it("should return value as null if schema is LOCATION and value is null ", () => {
      const val = getValues({
        event: {},
        probe,
        dataItemName: "location"
      })
      expect(val).to.eql(null)
    })
    it("should return null if schema is DOUBLE and value is null", () => {
      const val = getValues({
        event: {},
        probe,
        dataItemName: "double"
      })
      expect(val).to.eql(null)
    })
    it("should return null if schema is UNKNOWN and value is null", () => {
      const log = getMockLog()
      const val = getValues({
        event: {},
        log,
        probe,
        dataItemName: "probeAbsent"
      })
      expect(val).to.eql(null)
    })
  })
})
