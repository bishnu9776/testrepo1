import {log} from "../../logger"
import {parseGPSTPV} from "./GPSTPV"

export const parseChannelMessage = ({data, attributes, probe}) => {
  switch (attributes.channel) {
    case "gps_tpv":
      return parseGPSTPV({data, attributes, probe})
    default: {
      log.warn({ctx: {message: data.toString()}}, "Could not parse message")
      return null
    }
  }
}
