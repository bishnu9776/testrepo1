import R from "ramda"
import {decompressMessage} from "./decompressMessage"
import {ACK_MSG_TAG} from "../constants"
import {parseChannelMessage} from "./channelParser"

const {env} = process
export const formatData = ({log, metricRegistry, probe}) => async msg => {
  const shouldDecompressMessage = env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG
    ? JSON.parse(env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG)
    : true

  let decompressedMessage
  let parsedMessage

  try {
    if (shouldDecompressMessage) {
      decompressedMessage = await decompressMessage(msg.data)
    } else {
      decompressedMessage = msg.data
    }
  } catch (e) {
    metricRegistry.updateStat("Counter", "decompress_failures", 1, {})
    return null
  }

  try {
    parsedMessage = JSON.parse(decompressedMessage.toString())
    // const {attributes} = msg.meta
    // construct events using attributes
    // const filepath = path.join(__dirname, `../../test/dummyMocks/${msg.ackId}.json`)
    // const objToWrite = {
    //   attributes: msg.attributes,
    //   data: parsedMessage
    // }
    // fs.writeFileSync(filepath, JSON.stringify(objToWrite, null, 2), {flag: "w"})
    const dataItems = parseChannelMessage({data: parsedMessage, attributes: msg.attributes, probe})

    return [R.flatten([dataItems]).map(x => ({...x, tag: "MTConnectDataItems"})), {message: msg, tag: ACK_MSG_TAG}]
  } catch (e) {
    metricRegistry.updateStat("Counter", "parse_failures", 1, {})
    log.error({ctx: {data: decompressedMessage.toString()}}, "Could not parse string to JSON") // change to debug once we know how to handle all data
    return null
  }
}
