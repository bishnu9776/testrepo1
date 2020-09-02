import {isNilOrEmpty} from "../utils/isNilOrEmpty"

export const isModelPresentForDevice = deviceModelMapping => {
  const shouldFilterEventsForDeviceWithoutModel = JSON.parse(
    process.env.VI_SHOULD_DROP_EVENTS_FOR_DEVICE_WITHOUT_MODEL || "false"
  )
  return event => {
    if (!shouldFilterEventsForDeviceWithoutModel) {
      return true
    }
    if (event.tag === "ack" || !isNilOrEmpty(deviceModelMapping[event.device_uuid])) {
      return true
    }
    return false
  }
}
