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

const getGen2DataParser = appContext => {
  const {log} = appContext
  return ({message, probe}) => {
    return parseGen2BufferedData({message, probe, log})
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

export const getCreateDataItemFromMessageFn = appContext => {
  const parseGen1Data = getGen1DataParser(appContext)
  const parseGen2Data = getGen2DataParser(appContext)

  return ({message, probe}) => {
    const isGen2Data = JSON.parse(process.env.IS_GEN_2_DATA || "false")
    if (isGen2Data) {
      return parseGen2Data({message, probe})
    }
    return parseGen1Data({message})
  }
}

// const createCompositeDataItems = (dataItems, attributes, probe) => {
//   const compositeDataItems = {
//     location: {lat: "lat_deg", lon: "lon_deg"},
//     acceleration: {x: "ACC_X_MPS2", y: "ACC_Y_MPS2", z: "ACC_Z_MPS2"}
//   }
//
//   const getValue = (dataItemName, values) => {
//     const schema = compositeDataItems[dataItemName]
//     return Object.keys(schema).reduce((acc, val, index) => {
//       return {...acc, [val]: values[index]}
//     }, {})
//   }
//
//   return Object.keys(compositeDataItems).map(compositeDataItemName => {
//     const keysToGetValueOf = Object.values(compositeDataItems[compositeDataItemName]);
//     const values = keysToGetValueOf.map(key => dataItems.find(dataItem => dataItem.data_item_name === key).value)
//     return getDataItem({
//       attributes,
//       dataItemName: compositeDataItemName,
//       timestamp: values[0].timestamp,
//       value: getValue(compositeDataItemName, values)
//     })
//   })
// }
