/* eslint-disable mocha/no-return-from-async */
import nock from "nock"
import {getDeviceInfoHandler} from "../../src/deviceModel/getDeviceInfoHandler"
import {clearEnv} from "../utils"
import {getMockLog} from "../stubs/logger"
import {clearStub} from "../stubs/clearStub"
import {mockDeviceRulesGetSuccess, mockDeviceRulesPutSuccess} from "../apiResponseMocks/mockDeviceRulesResponse"

describe("Update device info", () => {
  const {env} = process
  const deviceRulesUrl = "https://svc-device-rules.com/device-rules"
  const deviceRulesDeviceEndpoint = "/device"
  let log
  let appContext
  beforeEach(() => {
    nock.cleanAll()
    log = getMockLog()
    appContext = {
      log
    }
    env.VI_ATHER_COLLECTOR_MAX_RETRIES = 2
    env.VI_ATHER_COLLECTOR_RETRY_DELAY = 100
    env.VI_ATHER_COLLECTOR_RETRY_LOG_THRESHOLD = 1
    env.VI_JWT = "dummysecret"
    env.VI_VALUE_KEY = "value" // TODO
    env.VI_PLANT = "ather"
    env.VI_DEVICE_RULES_URL = deviceRulesUrl
    env.VI_SHOULD_UPDATE_DEVICE_RULES = "true"
    env.VI_COLLECTOR_IS_GEN_2_DATA = "true"

    mockDeviceRulesGetSuccess({
      baseUrl: deviceRulesUrl,
      getUrl: `${deviceRulesDeviceEndpoint}/ruleset`,
      response: [
        {device: "device-1", ruleset: "gen-2"},
        {device: "device-2", ruleset: "gen-2"}
      ]
    })
  })

  afterEach(() => {
    clearEnv()
    clearStub()
  })

  it("should prime with device-ruleset mapping on startup and should not update device rules for existing devices", async () => {
    const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
    const events = [
      {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type", seq: 1},
      {device_uuid: "device-2", value: "GEN2_450plus", data_item_name: "bike_type", seq: 2}
    ]

    await updateDeviceInfo(events[0])
    await updateDeviceInfo(events[1])

    expect(log.info).to.not.have.been.calledWithMatch(
      "Successfully updated device rules for device: device-1 with ruleset: gen-2"
    )
    expect(log.info).to.not.have.been.calledWithMatch(
      "Successfully updated device rules for device: device-2 with ruleset: gen-2"
    )
    expect(log.warn).to.not.have.been.calledWithMatch("Failed to update rules for device: device-1 with ruleset: gen-2")
    expect(log.warn).to.not.have.been.calledWithMatch("Failed to update rules for device: device-2 with ruleset: gen-2")

    expect(getUpdatedDeviceModelMapping()).to.eql({
      "device-1": "gen-2",
      "device-2": "gen-2"
    })
  })

  describe("On new devices, should update device-ruleset mapping with the gen from env", () => {
    it("for gen-1", async () => {
      env.VI_COLLECTOR_IS_GEN_2_DATA = "false"

      mockDeviceRulesPutSuccess({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-3/gen-1`,
        numSuccesses: 1
      })
      mockDeviceRulesPutSuccess({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-4/gen-1`,
        numSuccesses: 1
      })
      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)

      const events = [
        {device_uuid: "device-3", value: "GEN1_450", data_item_name: "bike_type", seq: 1},
        {device_uuid: "device-4", value: "GEN1_450", data_item_name: "bike_type", seq: 2}
      ]

      await updateDeviceInfo(events[0])
      await updateDeviceInfo(events[1])

      expect(getUpdatedDeviceModelMapping()).to.eql({
        "device-1": "gen-2",
        "device-2": "gen-2",
        "device-3": "gen-1",
        "device-4": "gen-1"
      })
    })

    it("for gen-2", async () => {
      env.VI_COLLECTOR_IS_GEN_2_DATA = "true"
      mockDeviceRulesPutSuccess({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-3/gen-2`,
        numSuccesses: 1
      })
      mockDeviceRulesPutSuccess({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-4/gen-2`,
        numSuccesses: 1
      })
      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)

      const events = [
        {device_uuid: "device-3", value: "GEN2_450plus", data_item_name: "bike_type", seq: 1},
        {device_uuid: "device-4", value: "GEN2_450plus", data_item_name: "bike_type", seq: 2}
      ]

      await updateDeviceInfo(events[0])
      await updateDeviceInfo(events[1])

      expect(getUpdatedDeviceModelMapping()).to.eql({
        "device-1": "gen-2",
        "device-2": "gen-2",
        "device-3": "gen-2",
        "device-4": "gen-2"
      })
    })
  })
})
