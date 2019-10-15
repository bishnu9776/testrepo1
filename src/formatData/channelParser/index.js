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

export const parseChannelMessage = ({data, attributes}) => {
  switch (attributes.channel) {
    case "gps_tpv":
      return parseGPSTPV({data, attributes})
    case "can":
      return parseCAN({data, attributes})
    case "mcu":
      return parseMCU({data, attributes})
    case "heman":
      return parseHEMAN({data, attributes})
    case "imu":
      return parseIMU({data, attributes})
    case "events":
      return parseEVENTS({data, attributes})
    case "vcu":
      return parseVCU({data, attributes})
    case "session":
      return parseSESSION({data, attributes})
    case "bike_info":
      return parseBIKEINFO({data, attributes})
    case "soh":
      return null
    case "soh2":
      return null
    default: {
      log.warn(
        {ctx: {message: JSON.stringify(data), attributes: JSON.stringify(attributes)}},
        "No parser for message. Dropping event"
      )
      return null
    }
  }
}
