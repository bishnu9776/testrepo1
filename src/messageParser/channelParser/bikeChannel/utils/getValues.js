/* eslint-disable global-require, import/no-dynamic-require */
import {isNil, all, last} from "ramda"
import {errorFormatter} from "../../../../utils/errorFormatter"
import {delayAndExit} from "../../../../utils/delayAndExit"

const getSingleValue = ({event, valuesKeys}) => (isNil(event[valuesKeys[0].value]) ? null : event[valuesKeys[0].value])
const getCompositeValue = ({event, valuesKeys}) => {
  const compositeValue = valuesKeys.reduce((acc, {key, value}) => {
    return {...acc, [key]: isNil(event[value]) ? null : event[value]}
  }, {})
  return maybeReturnValue(compositeValue)
}
const getStringValue = ({event, valuesKeys}) => {
  const value = getSingleValue({event, valuesKeys})
  if (isNil(value)) {
    return ""
  }
  return typeof value === "string" ? value : JSON.stringify(value)
}

const schema = {
  int: getSingleValue,
  number: getSingleValue,
  string: getStringValue,
  boolean: getSingleValue,
  object: getCompositeValue
}

const defaultValuesKeys = dataItemName => [{value: dataItemName}]
const defaultValueSchema = {type: "string"}

const maybeReturnValue = value => {
  const areAllValuesNull = all(isNil)(Object.values(value))
  return areAllValuesNull ? null : value
}

export const getValuesFn = (probe, log) => {
  const valuesKeysMappingFilePath = process.env.VI_COLLECTOR_VALUES_KEYS_MAPPING_PATH
  const valuesSchemaFilePath = process.env.VI_COLLECTOR_VALUES_SCHEMA_PATH
  let valuesKeysMapping
  let valuesSchemaDefinition
  try {
    valuesSchemaDefinition = require(valuesSchemaFilePath)
    valuesKeysMapping = require(valuesKeysMappingFilePath)
  } catch (error) {
    log.error({error: errorFormatter(error)}, "Error loading config files, exiting application")
    delayAndExit(3)
  }

  const getValuesSchema = schemaDef => {
    if (!schemaDef) {
      return defaultValueSchema
    }
    if (schemaDef.$ref) {
      const schemaRef = last(schemaDef.$ref.split("/"))
      return valuesSchemaDefinition[schemaRef] || defaultValueSchema
    } else {
      return schemaDef
    }
  }

  return ({event, dataItemName}) => {
    let probeForDataItem = probe[dataItemName]
    if (!probeForDataItem) {
      log.warn(`Data item: ${dataItemName} is not present in the probe.`)
      probeForDataItem = {}
    }

    const valuesKeys = valuesKeysMapping[dataItemName] || defaultValuesKeys(dataItemName)

    const {values_schema: valuesSchemaDef} = probeForDataItem
    const valuesSchema = getValuesSchema(valuesSchemaDef)

    return schema[valuesSchema.type]({event, valuesKeys, dataItemName})
  }
}
