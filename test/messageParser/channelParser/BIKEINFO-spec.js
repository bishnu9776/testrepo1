import {BIKEINFO} from "../../fixtures/bikeChannels/BIKEINFO"
import {getCreateDataItemFromMessageFn} from "../../../src/messageParser/channelParser"
import probe from "../../fixtures/probe.json"
import {getParsedMessageFn} from "../../utils/getParsedMessage"

describe("Parses BIKEINFO", () => {
  const createDataItemsFromMessage = getCreateDataItemFromMessageFn()

  it("parses given messages", () => {
    const getParsedMessage = getParsedMessageFn("bike_info", "s_100")
    const parsedMessage = [
      getParsedMessage("release_name-v1", "release_name", "tintin2-release-24-Jul-2019-559857", 1, 1),
      getParsedMessage("bms_version-v1", "bms_version", "6_2_0", 1, 1),
      getParsedMessage("charger_version-v1", "charger_version", "v1", 1, 1),
      getParsedMessage("sim_ccid-v1", "sim_ccid", "123", 1, 1),
      getParsedMessage("sim_cimi-v1", "sim_cimi", "1234", 1, 1),
      getParsedMessage("system_boot_time-v1", "system_boot_time", "         system boot  Feb 24 14:27", 1, 1),
      getParsedMessage("mender_artifact_ver-v1", "mender_artifact_ver", "s340-narita-img-4.0.0.559857-dev", 1, 1),
      getParsedMessage("mcu_version-v1", "mcu_version", "4a234895", 1, 1),
      getParsedMessage("vin-v1", "vin", "", 1, 1),
      getParsedMessage("bike_type-v1", "bike_type", "Gen1.5_450", 1, 1),
      getParsedMessage("motor_version-v1", "motor_version", "3_6_8", 1, 1)
    ]
    expect(createDataItemsFromMessage({...BIKEINFO, probe})).to.eql(parsedMessage)
  })
})
