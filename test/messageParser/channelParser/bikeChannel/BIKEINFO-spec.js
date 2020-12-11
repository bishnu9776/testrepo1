import {BIKEINFO} from "../../fixtures/bikeChannels/BIKEINFO"
import {getCreateBikeEventFromMessageFn} from "../../../../src/messageParser/channelParser/bikeChannel"
import probe from "../../../fixtures/bike-probe.json"
import {getParsedMessageFn} from "../../../utils/getParsedMessage"
import {getMockLog} from "../../../stubs/logger"
import {getMockMetricRegistry} from "../../../stubs/getMockMetricRegistry"
import {clearEnv} from "../../../utils"

describe("Parses BIKEINFO", () => {
  let appContext
  let log
  let metricRegistry

  beforeEach(() => {
    log = getMockLog()
    metricRegistry = getMockMetricRegistry()
    appContext = {log, metricRegistry}
    process.env.VI_GEN1_DATAITEM_ID_VERSION = "v1"
  })

  afterEach(() => {
    clearEnv()
  })

  it("parses given messages", () => {
    const createDataItemsFromMessage = getCreateBikeEventFromMessageFn(appContext, probe)

    const getParsedMessage = getParsedMessageFn("bike_info", "s_100")
    const parsedMessage = [
      getParsedMessage("release_name", "tintin2-release-24-Jul-2019-559857", 1, 1),
      getParsedMessage("bms_version", "6_2_0", 1, 1),
      getParsedMessage("charger_version", "v1", 1, 1),
      getParsedMessage("sim_ccid", "123", 1, 1),
      getParsedMessage("sim_cimi", "1234", 1, 1),
      getParsedMessage("system_boot_time", "         system boot  Feb 24 14:27", 1, 1),
      getParsedMessage("mender_artifact_ver", "s340-narita-img-4.0.0.559857-dev", 1, 1),
      getParsedMessage("mcu_version", "4a234895", 1, 1),
      getParsedMessage("vin", "", 1, 1),
      getParsedMessage("bike_type", "Gen1.5_450", 1, 1),
      getParsedMessage("motor_version", "3_6_8", 1, 1)
    ]
    expect(createDataItemsFromMessage({message: BIKEINFO})).to.eql(parsedMessage)
  })
})
