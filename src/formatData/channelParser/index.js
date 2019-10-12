import {log} from "../../logger"
import {parseGPSTPV} from "./GPSTPV"
import {parseCAN} from "./CAN"
import {parseMCU} from "./MCU"

export const parseChannelMessage = ({data, attributes, probe}) => {
  switch (attributes.channel) {
    case "gps_tpv":
      return parseGPSTPV({data, attributes, probe})
    case "can":
      return parseCAN({data, attributes, probe})
    case "mcu":
      return parseMCU({data, attributes, probe})
    default: {
      log.warn({ctx: {message: data.toString()}}, "Could not parse message")
      return null
    }
  }
}
