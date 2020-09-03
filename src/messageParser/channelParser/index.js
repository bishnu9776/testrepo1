import {isNil} from "ramda"
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
import {parseGen2BufferedData} from "./GEN2"
import {parseGen2UnbufferedData} from "./GEN2_UNBUFFERED"

const getGen2DataParser = (appContext, probe) => {
  const {log} = appContext
  const channelParserConfig = {
    buffered_channel: parseGen2BufferedData(appContext, probe),
    unbuffered_channel: parseGen2UnbufferedData
  }
  const channelNotInParserConfig = channel => isNil(channelParserConfig[channel])

  return ({message}) => {
    const {channel} = message.attributes

    if (channelNotInParserConfig(channel)) {
      log.info({ctx: {message: JSON.stringify(message, null, 2)}}, "No parser for message. Dropping event")
      return []
    }
    return channelParserConfig[channel]({message})
  }
}

const getGen1DataParser = appContext => {
  const {log, metricRegistry} = appContext
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
  return ({message}) => {
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

export const getCreateDataItemFromMessageFn = (appContext, probe) => {
  const parseGen1Data = getGen1DataParser(appContext)
  const parseGen2Data = getGen2DataParser(appContext, probe)

  return ({message}) => {
    const isGen2Data = JSON.parse(process.env.VI_COLLECTOR_IS_GEN_2_DATA || "false")
    if (isGen2Data) {
      return parseGen2Data({message})
    }
    return parseGen1Data({message})
  }
}
