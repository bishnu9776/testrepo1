import {omit} from "ramda"

const getValueKey = ({probeInfo}) => {
  if (!probeInfo) {
    return "value"
  }

  if (probeInfo.category === "SAMPLE") {
    return "value_sample"
  }

  if (probeInfo.category === "EVENT") {
    return "value_event"
  }

  if (probeInfo.category === "LOCATION") {
    return "value_location"
  }

  if (probeInfo.category === "LOG" || probeInfo.data_item_name === "can_raw") {
    return "values"
  }

  return "value"
}

export const getMergeProbeInfoFn = probe => {
  return event => {
    const probeInfo = probe[event.data_item_name]
    const valueKey = getValueKey({probeInfo})
    let {value} = event
    if (valueKey === "value_event" && typeof value !== "string") {
      value = JSON.stringify(event.value)
    }

    return {
      ...omit(["value"], event),
      [valueKey]: value,
      values: value,
      ...probeInfo
    }
  }
}
