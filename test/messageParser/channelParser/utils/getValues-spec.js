import {getValues} from "../../../../src/messageParser/channelParser/utils/getValues"
import {getMockLog} from "../../../stubs/logger"

describe("getValues spec", () => {
  describe("probe is not properly defined", () => {
    const probe = {
      without_values_schema: {
        data_item_name: "without_values_schema",
        data_item_type: "WITHOUT_VALUES_SCHEMA"
      },
      without_values_keys: {
        data_item_name: "without_values_keys",
        data_item_type: "WITHOUT_VALUE_KEYS",
        values_schema: "STRING"
      },
      value_keys_without_schema: {
        data_item_name: "value_keys_without_schema",
        data_item_type: "VALUE_KEYS_WITHOUT_SCHEMA",
        values_keys: [{key: "foo", value: "without_values_schema"}]
      }
    }
    const event = {
      without_probe: 1,
      without_values_schema: 2,
      without_values_keys: 3
    }
    it("should take schema as UNKNOWN when probe is not present", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "without_probe"})).to.be.equal("1")
      expect(log.warn).to.have.been.calledWith("Data item: without_probe is not present in the probe.")
    })

    it("should take schema as UNKNOWN and return stringified value when probe doesn't have values_schema", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "without_values_schema"})).to.be.equal("2")
    })

    it("should take values_keys as default when it is not defined in the probe", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "without_values_keys"})).to.be.equal(3)
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
      },
      e: {
        synthetic: true,
        data_item_name: "e",
        data_item_type: "LOC",
        values_schema: "LOCATION",
        values_keys: [
          {key: "a", value: "a"},
          {key: "b", value: "b"}
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
      g: {
        synthetic: true,
        data_item_name: "g",
        data_item_type: "G",
        values_schema: "JSON",
        values_keys: [
          {key: "a", value: "a"},
          {key: "b", value: "b"}
        ]
      }
    }
    const event = {
      a: 1,
      b: 2.2,
      c: "3",
      probeAbsent: null
    }

    it("should return value as is if schema is INT ", () => {
      expect(getValues({event, probe, dataItemName: "a"})).to.be.equal(1)
    })

    it("should return value as is if schema is DOUBLE ", () => {
      expect(getValues({event, probe, dataItemName: "b"})).to.be.equal(2.2)
    })

    it("should return value as is if schema is STRING ", () => {
      expect(getValues({event, probe, dataItemName: "c"})).to.be.equal("3")
    })

    it("should return value based on value keys if schema is SPATIAL ", () => {
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

    it("should return value based on value keys if schema is LOCATION ", () => {
      const val = getValues({
        event,
        probe,
        dataItemName: "e"
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

    it("should return value if value keys schema is JSON in probe", () => {
      const val = getValues({
        event,
        probe,
        dataItemName: "g"
      })
      expect(val).to.deep.equal({
        g: {
          a: 1,
          b: 2.2
        }
      })
    })

    describe("should return null when event value is null", () => {
      it("if schema is JSON", () => {
        const val = getValues({
          event: {},
          probe,
          dataItemName: "g"
        })
        expect(val).to.eql(null)
      })

      it("if schema is LOCATION", () => {
        const val = getValues({
          event: {},
          probe,
          dataItemName: "e"
        })
        expect(val).to.eql(null)
      })

      it("if schema is DOUBLE", () => {
        const val = getValues({
          event: {},
          probe,
          dataItemName: "b"
        })
        expect(val).to.eql(null)
      })

      it("if schema is UNKNOWN", () => {
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
})
