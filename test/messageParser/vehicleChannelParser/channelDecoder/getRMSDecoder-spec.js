import {dissoc} from "ramda"
import {PRE_BIG_SINK_RMS} from "../../../fixtures/bikeChannels/RMS"
import {clearEnv} from "../../../utils"
import {getRMSDecoder} from "../../../../src/messageParser/channelParser/gridChannelParser/channelDecoder/getRMSDecoder"

describe("RMS decoder", () => {
  const {env} = process
  before(() => {
    env.VI_PRE_BIG_SINK_INPUT = "true"
    env.VI_RMS_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/rmsDecoderConfig.js"
    env.VI_RMS_MESSAGE_BYTE_LENGTH = "64"
  })

  after(() => {
    clearEnv()
  })

  it("should decode RMS message", () => {
    const decodedDataItems = {
      phase1_voltage: 242.97,
      phase2_voltage: 1.7,
      phase3_voltage: 1.7,
      phase1_current: 0.08,
      phase2_current: 0.01,
      phase3_current: 0.01,
      phase1_power: 0.97,
      phase2_power: 0.0,
      phase3_power: 0.0,
      energy_consumed_in_24hours: 0.0025853626,
      frequency: 50.07,
      rms_uptime: 1890209,
      rms_health: "",
      pod1_session_id: 0,
      pod2_session_id: 0,
      pod3_session_id: 0,
      miscellaneous: 0,
      phase1_vmax: 243.02,
      phase2_vmax: 9.69,
      phase3_vmax: 1.7,
      phase1_vmin: 238.99,
      phase2_vmin: 1.7,
      phase3_vmin: 1.7,
      phase1_imax: 0.0,
      phase2_imax: 0.0,
      phase3_imax: 0.0,
      neatural_current: 0.07,
      reset_cause: 2,
      health: 8,
      P1_over_voltage: 0,
      P1_under_voltage: 0,
      P1_over_current: 0,
      P2_over_voltage: 0,
      P2_under_voltage: 1,
      P2_over_current: 0,
      P3_over_voltage: 0,
      P3_under_voltage: 1,
      P3_over_current: 0,
      Bad_frequency: 0
    }
    const expected = {...decodedDataItems, ...dissoc("trip_flag", PRE_BIG_SINK_RMS.data[0])}

    const parsedData = getRMSDecoder()(PRE_BIG_SINK_RMS)
    expect(parsedData).to.eql([expected])
  })
})
