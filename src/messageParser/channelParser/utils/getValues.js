import {isNil} from "ramda"

const getSingleValue = ({event, valuesKeys}) => event[valuesKeys[0].value] || null
const getCompositeValue = ({event, valuesKeys}) => {
  const compositeValue = valuesKeys.reduce((acc, {key, value}) => {
    return {...acc, [key]: event[value] || null}
  }, {})
  return maybeReturnValue(compositeValue)
}

const schema = {
  INT: getSingleValue,
  DOUBLE: getSingleValue,
  STRING: getSingleValue,
  SPATIAL: getCompositeValue,
  LOCATION: getCompositeValue,
  JSON: ({event, valuesKeys, dataItemName}) => {
    const jsonValue = valuesKeys.reduce(
      (acc, {key, value}) => {
        const dataItemValue = {...acc[dataItemName], [key]: event[value] || null}
        return {...acc, [dataItemName]: dataItemValue}
      },
      {[dataItemName]: {}}
    )
    return isNil(maybeReturnValue(jsonValue[dataItemName])) ? null : jsonValue
  },
  UNKNOWN: ({event, valuesKeys}) => {
    const value = getSingleValue({event, valuesKeys})
    if (isNil(value)) {
      return null
    }
    return typeof value === "string" ? value : JSON.stringify(value)
  }
}

const defaultValuesKeys = dataItemName => [{value: dataItemName}]
const defaultValueSchema = "UNKNOWN"

const maybeReturnValue = value => {
  const shouldReturnNull = Object.values(value).reduce((acc, val) => {
    if (!acc) {
      return acc
    }
    if (!isNil(val)) {
      return false
    }
    return acc
  }, true)

  return shouldReturnNull ? null : value
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
