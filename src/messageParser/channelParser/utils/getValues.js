import {isNil, all} from "ramda"

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
const defaultValueSchema = "string"

const maybeReturnValue = value => {
  const areAllValuesNull = all(isNil)(Object.values(value))
  return areAllValuesNull ? null : value
}

export const getValues = ({event, dataItemName, probe, log}) => {
  let probeForDataItem = probe[dataItemName]
  if (!probeForDataItem) {
    log.warn(`Data item: ${dataItemName} is not present in the probe.`)
    probeForDataItem = {}
  }

  const {
    values_keys: valuesKeys = defaultValuesKeys(dataItemName),
    values_schema: valuesSchema = defaultValueSchema
  } = probeForDataItem
  return schema[valuesSchema]({event, valuesKeys, dataItemName})
}
