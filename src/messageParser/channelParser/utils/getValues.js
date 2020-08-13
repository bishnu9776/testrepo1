const getSingleValue = ({event, valuesKeys}) => event[valuesKeys[0].value] || null
const getCompositeValue = ({event, valuesKeys}) => {
  return valuesKeys.reduce((acc, {key, value}) => {
    return {...acc, [key]: event[value] || null}
  }, {})
}

const schema = {
  INT: getSingleValue,
  DOUBLE: getSingleValue,
  STRING: getSingleValue,
  SPATIAL: getCompositeValue,
  LOCATION: getCompositeValue,
  JSON: ({event, valuesKeys, dataItemName}) => {
    return valuesKeys.reduce(
      (acc, {key, value}) => {
        const dataItemValue = {...acc[dataItemName], [key]: event[value] || null}
        return {...acc, [dataItemName]: dataItemValue}
      },
      {[dataItemName]: {}}
    )
  },
  UNKNOWN: ({event, valuesKeys}) => {
    const value = getSingleValue({event, valuesKeys})
    return typeof value === "string" ? value : JSON.stringify(value)
  }
}

const defaultValuesKeys = dataItemName => [{value: dataItemName}]

export const getValues = ({event, dataItemName, probe, log}) => {
  let probeForDataItem = probe[dataItemName]
  if (!probeForDataItem) {
    log.warn(`Data item: ${dataItemName} is not present in the probe.`)
    probeForDataItem = {values_schema: "UNKNOWN"}
  }

  const {values_keys: valuesKeys = defaultValuesKeys(dataItemName), values_schema: valuesSchema} = probeForDataItem
  return schema[valuesSchema]({event, valuesKeys, dataItemName})
}
