/* eslint-disable mocha/no-return-from-async */
import nock from "nock"
import {
  mockDeviceRegistryPostSuccessResponse,
  mockDeviceRegistryPutSuccessAfterFailure,
  mockDeviceRegistryPutSuccess
} from "../apiResponseMocks/mockDeviceRegistryResponse"
import {getDeviceInfoHandler} from "../../src/deviceModel/getDeviceInfoHandler"
import {clearEnv} from "../utils"
import {getMockLog} from "../stubs/logger"
import {clearStub} from "../stubs/clearStub"
import {
  mockDeviceRulesPutFailure,
  mockDeviceRulesPutSuccess,
  mockDeviceRulesPutSuccessAfterFailure
} from "../apiResponseMocks/mockDeviceRulesResponse"

describe("Update device info", () => {
  const {env} = process
  const deviceRegistryUrl = "https://svc-device-registry.com/device-registry"
  const deviceRegistryDevicesEndpoint = "/devices"
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
    env.VI_VALUE_KEY = "value"
    env.VI_DATAITEM_MODEL_LIST = "bike_type,model"
    env.VI_PLANT = "ather"
    env.VI_DEVICE_REGISTRY_DEVICES_URL = `${deviceRegistryUrl}/devices`
    env.VI_DEVICE_RULES_DEVICE_URL = `${deviceRulesUrl}/device`
    env.VI_SHOULD_UPDATE_DEVICE_RULES = "true"
  })

  afterEach(() => {
    clearEnv()
    clearStub()
  })

  describe("Updates to device registry when device rules API is up", () => {
    describe("Device model mapping is empty on startup", () => {
      beforeEach(() => {
        mockDeviceRegistryPostSuccessResponse(deviceRegistryUrl, "/devices", [])
        mockDeviceRulesPutSuccess({baseUrl: deviceRulesUrl, putUrl: `${deviceRulesDeviceEndpoint}/device-1/450plus`})
        mockDeviceRulesPutSuccess({baseUrl: deviceRulesUrl, putUrl: `${deviceRulesDeviceEndpoint}/device-2/450x`})
        mockDeviceRulesPutSuccess({baseUrl: deviceRulesUrl, putUrl: `${deviceRulesDeviceEndpoint}/device-3/450plus`})
        mockDeviceRulesPutSuccess({baseUrl: deviceRulesUrl, putUrl: `${deviceRulesDeviceEndpoint}/device-3/450x`})
      })

      it("update device mapping on receiving new device with value in gen_model format", async () => {
        const putRequestBody1 = {model: "450plus"}
        const putRequestBody2 = {model: "450x"}
        const events = [
          {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type"},
          {device_uuid: "device-2", value: "GEN2_450x", data_item_name: "bike_type"}
        ]
        mockDeviceRegistryPutSuccess(
          deviceRegistryUrl,
          `${deviceRegistryDevicesEndpoint}/${events[0].device_uuid}`,
          putRequestBody1,
          "ok"
        )
        mockDeviceRegistryPutSuccess(
          deviceRegistryUrl,
          `${deviceRegistryDevicesEndpoint}/${events[1].device_uuid}`,
          putRequestBody2,
          "ok"
        )

        const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
        // eslint-disable-next-line sonarjs/no-identical-functions
        return Promise.all(events.map(updateDeviceInfo)).then(() => {
          expect(getUpdatedDeviceModelMapping()).to.eql({
            "device-1": "450plus",
            "device-2": "450x"
          })
        })
      })

      it("update device mapping on receiving new device with value in model format", async () => {
        const events = [
          {device_uuid: "device-1", value: "450plus", data_item_name: "bike_type"},
          {device_uuid: "device-2", value: "450x", data_item_name: "bike_type"}
        ]
        mockDeviceRegistryPutSuccess(
          deviceRegistryUrl,
          `${deviceRegistryDevicesEndpoint}/${events[0].device_uuid}`,
          {model: "450plus"},
          "ok"
        )
        mockDeviceRegistryPutSuccess(
          deviceRegistryUrl,
          `${deviceRegistryDevicesEndpoint}/${events[1].device_uuid}`,
          {model: "450x"},
          "ok"
        )
        const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)

        // eslint-disable-next-line sonarjs/no-identical-functions
        return Promise.all(events.map(updateDeviceInfo)).then(() => {
          expect(getUpdatedDeviceModelMapping()).to.eql({
            "device-1": "450plus",
            "device-2": "450x"
          })
        })
      })

      it("should not update device model mapping when a device exists and model becomes invalid", async () => {
        const events = [
          {device_uuid: "device-1", value: "450plus", data_item_name: "bike_type"},
          {device_uuid: "device-1", data_item_name: "bike_type"}
        ]

        mockDeviceRegistryPutSuccess(
          deviceRegistryUrl,
          `${deviceRegistryDevicesEndpoint}/${events[0].device_uuid}`,
          {model: "450plus"},
          "ok"
        )

        const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
        return Promise.all(events.map(updateDeviceInfo)).then(() => {
          expect(getUpdatedDeviceModelMapping()).to.eql({
            "device-1": "450plus"
          })
        })
      })

      it("update devices mapping when device exists and model changes", async () => {
        const events = [
          {device_uuid: "device-3", value: "450plus", data_item_name: "bike_type"},
          {device_uuid: "device-3", value: "450x", data_item_name: "bike_type"}
        ]
        mockDeviceRegistryPutSuccess(
          deviceRegistryUrl,
          `${deviceRegistryDevicesEndpoint}/${events[0].device_uuid}`,
          {model: "450plus"},
          "ok"
        )
        mockDeviceRegistryPutSuccess(
          deviceRegistryUrl,
          `${deviceRegistryDevicesEndpoint}/${events[0].device_uuid}`,
          {model: "450x"},
          "ok"
        )
        const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)

        return Promise.all(events.map(updateDeviceInfo)).then(() => {
          expect(getUpdatedDeviceModelMapping()).to.eql({
            "device-3": "450x"
          })
        })
      })

      it("should not retry on non retryable error and should not update device model", async () => {
        const event = {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type"}
        const putUrl = `${deviceRegistryDevicesEndpoint}/${event.device_uuid}`
        mockDeviceRegistryPutSuccessAfterFailure(deviceRegistryUrl, putUrl, {model: "450plus"}, 400, 1, {})
        const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
        await updateDeviceInfo(event)
        expect(getUpdatedDeviceModelMapping()).to.eql({})
        expect(log.warn).to.have.been.calledOnce
      })

      it("should retry on retryable error when retry config has non-zero retries", async () => {
        const event = {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type"}
        const putUrl = `${deviceRegistryDevicesEndpoint}/${event.device_uuid}`
        mockDeviceRegistryPutSuccessAfterFailure(deviceRegistryUrl, putUrl, {model: "450plus"}, 503, 2, {})
        const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
        await updateDeviceInfo(event)
        expect(log.warn).to.have.been.calledTwice
        expect(getUpdatedDeviceModelMapping()).to.eql({"device-1": "450plus"})
      })

      it("should retry on retryable error and log error when retry caps out", async () => {
        const event = {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type"}
        const putUrl = `${deviceRegistryDevicesEndpoint}/${event.device_uuid}`
        mockDeviceRegistryPutSuccessAfterFailure(deviceRegistryUrl, putUrl, {model: "450plus"}, 503, 3, {})
        const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
        await updateDeviceInfo(event)
        expect(log.warn).to.have.been.calledThrice
        expect(log.error).to.have.been.calledOnce
        expect(getUpdatedDeviceModelMapping()).to.eql({})
      })
    })

    describe("Device model mapping is non-empty on startup", () => {
      it("do not update if existing device model mapping for device is correct", async () => {
        // Not mocking any PUT request as we won't send updates since device registry is up to date
        nock.cleanAll()
        mockDeviceRegistryPostSuccessResponse(deviceRegistryUrl, "/devices", [
          {device: "device-1", model: "450plus"},
          {device: "device-2", model: "450x"}
        ])

        const events = [
          {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type"},
          {device_uuid: "device-2", value: "GEN2_450x", data_item_name: "bike_type"}
        ]

        const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
        return Promise.all(events.map(updateDeviceInfo)).then(() => {
          expect(getUpdatedDeviceModelMapping()).to.eql({
            "device-1": "450plus",
            "device-2": "450x"
          })
          expect(log.warn.callCount).to.eql(0)
        })
      })
    })
  })

  describe("When device rules API is down", () => {
    beforeEach(() => {
      mockDeviceRegistryPostSuccessResponse(deviceRegistryUrl, "/devices", [])
    })

    it("does not attempt to update device registry if device rules update fails with non-retryable error", async () => {
      mockDeviceRulesPutFailure({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-1/450plus`,
        failureStatusCode: 400
      })
      const event = {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type"}

      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
      await updateDeviceInfo(event)
      expect(getUpdatedDeviceModelMapping()).to.eql({})
      expect(log.warn.callCount).to.eql(1)
      expect(log.warn).to.have.been.calledWithMatch("Failed to update rules for device: device-1 with model: 450plus")
    })

    it("retry's device rules and device model update if API fails with retryable error", async () => {
      mockDeviceRulesPutSuccessAfterFailure({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-1/450plus`,
        failureStatusCode: 503,
        numFailures: 1
      })

      const event = {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type"}

      mockDeviceRegistryPutSuccessAfterFailure(
        deviceRegistryUrl,
        `${deviceRegistryDevicesEndpoint}/${event.device_uuid}`,
        {model: "450plus"},
        503,
        1,
        {}
      )

      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
      await updateDeviceInfo(event)

      expect(getUpdatedDeviceModelMapping()).to.eql({
        "device-1": "450plus"
      })

      expect(log.warn.callCount).to.eql(2)
      expect(log.warn).to.have.been.calledWithMatch(
        {
          ctx: {
            requestConfig: JSON.stringify({
              url: `${deviceRulesUrl}/device/device-1/450plus`,
              method: "PUT",
              timeout: 30000
            })
          }
        },
        "Retrying request. Retry Count: 1"
      )
      expect(log.warn).to.have.been.calledWithMatch(
        {
          ctx: {
            requestConfig: JSON.stringify({
              url: `${deviceRegistryUrl}/devices/device-1`,
              method: "PUT",
              data: {model: "450plus"},
              timeout: 30000
            })
          }
        },
        "Retrying request. Retry Count: 1"
      )
    })
  })
})
