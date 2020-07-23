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

  // TODO make it generic after the discussion
  if (probeInfo.category === "LOG") {
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
      ...probeInfo
    }
  }
}
