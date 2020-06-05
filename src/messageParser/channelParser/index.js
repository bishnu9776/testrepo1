import {isNil} from "ramda"
import {log} from "../../logger"
import {parseGPSTPV} from "./GPSTPV"
import {parseCAN} from "./CAN"
import {parseMCU} from "./MCU"
import {parseHEMAN} from "./HEMAN"
import {parseIMU} from "./IMU"
import {parseEVENTS} from "./EVENTS"
import {parseVCU} from "./VCU"
import {parseSESSION} from "./SESSION"
import {parseBIKEINFO} from "./BIKEINFO"
import {parseSOH2} from "./SOH2"
import {parseSOH} from "./SOH"
import {endSpan, startSpan} from "../../apm"

export const getCreateDataItemFromMessageFn = () => {
  const channelParserConfig = {
    gps_tpv: parseGPSTPV,
    can: parseCAN(),
    mcu: parseMCU(),
    heman: parseHEMAN,
    imu: parseIMU,
    events: parseEVENTS,
    vcu: parseVCU(),
    session: parseSESSION,
    bike_info: parseBIKEINFO,
    soh: parseSOH,
    soh2: parseSOH2
  }

  const channelNotInParserConfig = channel => isNil(channelParserConfig[channel])

  return message => {
    // can log how many data items a single message was split to here as context
    const {channel} = message.attributes
    if (channel.match(/^can/)) {
      startSpan({message, spanName: "decoding", spanType: "decoding"})
      const decodedEvents = channelParserConfig.can(message)
      endSpan({message, spanName: "decoding", labels: {numEventsAfterDecoding: decodedEvents.length}})
      return decodedEvents
    }
    if (channelNotInParserConfig(channel)) {
      log.warn({ctx: {message: JSON.stringify(message, null, 2)}}, "No parser for message. Dropping event")
      return []
    }

    startSpan({message, spanName: "decoding", spanType: "decoding"})
    const decodedEvents = channelParserConfig[channel](message)
    endSpan({message, spanName: "decoding", labels: {numEventsAfterDecoding: decodedEvents.length}})

    return decodedEvents
  }
}
