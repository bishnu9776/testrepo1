import {omit} from "ramda"
import {getValueKey} from "./channelParser/helpers"

export const mergeProbeInfo = probe => event => {
  const probeInfo = probe[event.data_item_name]
  const valueKey = getValueKey({probeInfo, dataItemName: event.data_item_name})
  let {value} = event
  if ((valueKey === "value" || valueKey === "value_event") && typeof value !== "string") {
    value = JSON.stringify(event.value)
  }

  return {
    ...omit(["value"], event),
    [valueKey]: value,
    ...probeInfo
  }
}
