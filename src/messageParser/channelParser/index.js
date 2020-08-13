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
import {parseGen2Data} from "./GEN2"

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
    logs: parseLOG
  }

  const channelNotInParserConfig = channel => isNil(channelParserConfig[channel])

  return ({message, probe}) => {
    const isGen2Data = JSON.parse(process.env.IS_GEN_2_DATA || "false")

    if (isGen2Data) {
      return parseGen2Data({message, probe})
    }

    const {channel} = message.attributes
    if (channel.match(/^can/)) {
      return channelParserConfig.can(message)
    }
    if (channelNotInParserConfig(channel)) {
      log.warn({ctx: {message: JSON.stringify(message, null, 2)}}, "No parser for message. Dropping event")
      return []
    }
    return channelParserConfig[channel](message)
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
