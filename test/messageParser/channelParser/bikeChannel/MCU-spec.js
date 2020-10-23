import {difference} from "ramda"
import {MCU} from "../../fixtures/bikeChannels/MCU"
import {getCreateBikeEventFromMessageFn} from "../../../../src/messageParser/channelParser/bikeChannel"
import probe from "../../../fixtures/bike-probe.json"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../../../utils"
import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"

describe("Parses MCU", () => {
  const {env} = process
  let metricRegistry
  let appContext
  let log
  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
    env.VI_MCU_MESSAGE_BYTE_LENGTH = "104"
    setChannelDecoderConfigFileEnvs()
  })

  afterEach(() => {
    clearEnv()
  })

  it("parses given message", () => {
    const requiredKeys = ["channel", "data_item_id", "data_item_name", "device_uuid", "sequence", "timestamp", "value"]
    const createDataItemsFromMessage = getCreateBikeEventFromMessageFn(appContext, probe)
    const parsedMessage = createDataItemsFromMessage({message: MCU})

    expect(parsedMessage.length).to.eql(47)
    parsedMessage.forEach(e => {
      expect(difference(requiredKeys, Object.keys(e)).length).to.eql(0)
    })
  })

  it("when config paths are not given, should return empty array", () => {
    env.VI_MCU_DECODER_CONFIG_PATH = undefined
    const createDataItemsFromMessage = getCreateBikeEventFromMessageFn(appContext, probe)
    expect(createDataItemsFromMessage({message: MCU})).to.eql([])
  })
})
