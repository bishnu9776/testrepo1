import {getValues} from "../../../../src/messageParser/channelParser/utils/getValues"
import {getMockLog} from "../../../stubs/logger"

describe("getValues spec", () => {
  describe("probe is not properly defined", () => {
    const probe = {
      without_values_schema: {
        data_item_name: "without_values_schema",
        data_item_type: "WITHOUT_VALUES_SCHEMA"
      },
      value_keys_without_schema: {
        data_item_name: "value_keys_without_schema",
        data_item_type: "VALUE_KEYS_WITHOUT_SCHEMA",
        values_keys: [{key: "foo", value: "without_values_schema"}]
      },
      without_values_keys: {
        data_item_name: "without_values_keys",
        data_item_type: "WITHOUT_VALUE_KEYS",
        values_schema: {type: "string"}
      }
    }
    const event = {
      without_probe: 1,
      without_values_schema: 2,
      without_values_keys: 3
    }
    it("should take schema as string when probe is not present", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "without_probe"})).to.be.equal("1")
      expect(log.warn).to.have.been.calledWith("Data item: without_probe is not present in the probe.")
    })

    it("should take schema as string and return stringified value when probe doesn't have values_schema", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "without_values_schema"})).to.be.equal("2")
    })

    it("should take values_keys as default when it is not defined in the probe", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "without_values_keys"})).to.be.equal("3")
    })

    it("should return string of values when values_keys is present and schema is not", () => {
      const log = getMockLog()
      expect(getValues({event, probe, log, dataItemName: "value_keys_without_schema"})).to.be.equal("2")
    })
  })

  describe("when values_schema is defined", () => {
    const probe = {
      value_int: {
        data_item_name: "value_int",
        data_item_type: "VALUE_INT",
        values_schema: {type: "int"}
      },
      value_number: {
        data_item_name: "value_number",
        data_item_type: "VALUE_NUMBER",
        values_schema: {type: "number"}
      },
      value_string: {
        data_item_name: "value_string",
        data_item_type: "VALUE_STRING",
        values_schema: {type: "string"}
      },
      value_boolean: {
        synthetic: true,
        data_item_name: "value_boolean",
        data_item_type: "VALUE_BOOLEAN",
        values_schema: {type: "boolean"}
      },
      value_object_spatial: {
        synthetic: true,
        data_item_name: "value_object_spatial",
        data_item_type: "VALUE_OBJECT_SPATIAL",
        values_schema: {type: "object"},
        values_keys: [
          {key: "a", value: "value_int"},
          {key: "b", value: "value_number"},
          {key: "c", value: "value_string"}
        ]
      },
      value_object_location: {
        synthetic: true,
        data_item_name: "value_object_location",
        data_item_type: "VALUE_OBJECT_LOCATION",
        values_schema: {type: "object"},
        values_keys: [
          {key: "a", value: "value_int"},
          {key: "b", value: "value_number"}
        ]
      },
      value_object_location_with_null: {
        synthetic: true,
        data_item_name: "value_object_location",
        data_item_type: "VALUE_OBJECT_LOCATION",
        values_schema: {type: "object"},
        values_keys: [
          {key: "a", value: "value_int"},
          {key: "b", value: "lon"}
        ]
      }
    }
    const event = {
      value_int: 1,
      value_number: 2.2,
      value_string: "3",
      value_boolean: false,
      probeAbsent: null
    }

    describe("should return value when event value is not null", () => {
      it("should return value as is if schema is int ", () => {
        expect(getValues({event, probe, dataItemName: "value_int"})).to.be.equal(1)
      })

      it("should return value as is if schema is number ", () => {
        expect(getValues({event, probe, dataItemName: "value_number"})).to.be.equal(2.2)
      })

      it("should return value as is if schema is string ", () => {
        expect(getValues({event, probe, dataItemName: "value_string"})).to.be.equal("3")
      })

      it("should return value as is if schema is boolean ", () => {
        expect(getValues({event, probe, dataItemName: "value_boolean"})).to.be.equal(false)
      })

      it("should return value based on value keys if schema is object with spatial structure", () => {
        const val = getValues({
          event,
          probe,
          dataItemName: "value_object_spatial"
        })
        expect(val).to.deep.equal({
          a: 1,
          b: 2.2,
          c: "3"
        })
      })

      it("should return value based on value keys if schema is object with location structure", () => {
        const val = getValues({
          event,
          probe,
          dataItemName: "value_object_location"
        })
        expect(val).to.deep.equal({
          a: 1,
          b: 2.2
        })
      })

      it("should return value based on value keys when schema is object and return null for key not present", () => {
        const val = getValues({
          event,
          probe,
          dataItemName: "value_object_location_with_null"
        })
        expect(val).to.deep.equal({
          a: 1,
          b: null
        })
      })
    })

    describe("when event value is null", () => {
      it("should return null if schema is object", () => {
        const val = getValues({
          event: {},
          probe,
          dataItemName: "value_object_location"
        })
        expect(val).to.eql(null)
      })
      it("should return null if schema is number", () => {
        const val = getValues({
          event: {},
          probe,
          dataItemName: "value_number"
        })
        expect(val).to.eql(null)
      })
      it("should return null if schema is int", () => {
        const log = getMockLog()
        const val = getValues({
          event: {},
          log,
          probe,
          dataItemName: "value_int"
        })
        expect(val).to.eql(null)
      })
      it("should return null if schema is boolean", () => {
        const log = getMockLog()
        const val = getValues({
          event: {},
          log,
          probe,
          dataItemName: "value_boolean"
        })
        expect(val).to.eql(null)
      })
      it("should return empty string if schema is string", () => {
        const log = getMockLog()
        const val = getValues({
          event: {},
          log,
          probe,
          dataItemName: "value_string"
        })
        expect(val).to.eql("")
      })
    })
  })
})
