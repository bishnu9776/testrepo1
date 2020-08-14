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
import {parseLOG} from "./LOGS"
import {parseCANRAW} from "./CAN_RAW"

export const getCreateDataItemFromMessageFn = metricRegistry => {
  const channelParserConfig = {
    gps_tpv: parseGPSTPV,
    can: parseCAN(metricRegistry),
    mcu: parseMCU(),
    heman: parseHEMAN,
    imu: parseIMU,
    events: parseEVENTS,
    vcu: parseVCU(),
    session: parseSESSION,
    bike_info: parseBIKEINFO,
    soh: parseSOH,
    soh2: parseSOH2,
    logs: parseLOG,
    can_raw: parseCANRAW
  }

  const channelNotInParserConfig = channel => isNil(channelParserConfig[channel])

  return message => {
    const {channel} = message.attributes
    if (channel !== "can_raw" && channel.match(/^can/)) {
      return channelParserConfig.can(message)
    }
    if (channelNotInParserConfig(channel)) {
      log.warn({ctx: {message: JSON.stringify(message, null, 2)}}, "No parser for message. Dropping event")
      return []
    }
    return channelParserConfig[channel](message)
  }
}
