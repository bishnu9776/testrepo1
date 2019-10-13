import {log} from "../../logger"
import {parseGPSTPV} from "./GPSTPV"
import {parseCAN} from "./CAN"
import {parseMCU} from "./MCU"
import {parseHEMAN} from "./HEMAN"
import {parseIMU} from "./IMU"
import {parseEVENTS} from "./EVENTS"
import {parseVCU} from "./VCU"

// TODO: Do merge probe info and using correct value key outside of all the parsers
export const parseChannelMessage = ({data, attributes, probe}) => {
  switch (attributes.channel) {
    case "gps_tpv":
      return parseGPSTPV({data, attributes, probe})
    case "can":
      return parseCAN({data, attributes, probe})
    case "mcu":
      return parseMCU({data, attributes, probe})
    case "heman":
      return parseHEMAN({data, attributes, probe})
    case "imu":
      return parseIMU({data, attributes, probe})
    case "events":
      return parseEVENTS({data, attributes, probe})
    case "vcu":
      return parseVCU({data, attributes, probe})
    default: {
      log.warn({ctx: {message: data.toString()}}, "Could not parse message")
      return null
    }
  }
}
