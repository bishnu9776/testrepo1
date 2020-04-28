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

// TODO: Rename data to message and remove passing attributes separately if it's present in the message itself

export const getCreateDataItemFromMessageFn = () => {
  const channelParserConfig = {
    gps_tpv: parseGPSTPV,
    can: parseCAN(),
    mcu: parseMCU,
    heman: parseHEMAN,
    imu: parseIMU,
    events: parseEVENTS,
    vcu: parseVCU,
    session: parseSESSION,
    bike_info: parseBIKEINFO,
    soh: parseSOH,
    soh2: parseSOH2
  }

  const channelNotInParserConfig = channel => isNil(channelParserConfig[channel])

  return ({data, attributes}) => {
    if (attributes.channel.match(/^can/)) {
      return channelParserConfig.can({data, attributes})
    }
    if (channelNotInParserConfig(attributes.channel)) {
      log.warn(
        {ctx: {message: JSON.stringify(data), attributes: JSON.stringify(attributes)}},
        "No parser for message. Dropping event"
      )
      return []
    }
    return channelParserConfig[attributes.channel]({data, attributes})
  }
}
