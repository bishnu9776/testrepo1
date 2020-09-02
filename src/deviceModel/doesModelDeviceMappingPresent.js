export const doesModelDeviceMappingPresent = deviceModelMapping => event => {
  if (event.tag === "ack") {
    return true
  }
  if (deviceModelMapping[event.device_uuid]) {
    return true
  }
  return false
}
