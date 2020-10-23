import {clearEnv} from "../../../../utils"
import {getRMSDecoder} from "../../../../../src/messageParser/channelParser/gridChannel/channelDecoder/getRMSDecoder"
import {RMS_DATA_WITH_TRIP_FLAG} from "../../../fixtures/gridChannels/preBigSink/RMS_DATA_WITH_TRIP_FLAG"

describe("RMS decoder", () => {
  const {env} = process
  before(() => {
    env.VI_PRE_BIG_SINK_INPUT = "true"
    env.VI_RMS_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/rmsDecoderConfig.js"
  })

  after(() => {
    clearEnv()
  })

  it("should decode RMS message", () => {
    const expected = {
      Bad_frequency: 0,
      P1_over_current: 0,
      P1_over_voltage: 0,
      P1_under_voltage: 0,
      P2_over_current: 0,
      P2_over_voltage: 0,
      P2_under_voltage: 1,
      P3_over_current: 0,
      P3_over_voltage: 0,
      P3_under_voltage: 1,
      global_seq: "110325201",
      phase1_voltage: 247.5500030517578,
      seq_num: 117346,
      timestamp: 1603057919.952
    }

    const parsedData = getRMSDecoder()(RMS_DATA_WITH_TRIP_FLAG)
    expect(parsedData).to.eql([expected])
  })
})
