/* eslint-disable mocha/no-return-from-async */
import nock from "nock"
import {
  mockDeviceRegistryPostSuccessResponse,
  mockDeviceRegistryPutSuccess,
  mockDeviceRegistryPutSuccessAfterFailure
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
  })

  afterEach(() => {
    clearEnv()
    clearStub()
  })

  describe("Updates to device registry", () => {
    beforeEach(() => {
      env.VI_SHOULD_UPDATE_DEVICE_RULES = "false"
    })

    describe("Device model mapping is empty on startup", () => {
      beforeEach(() => {
        mockDeviceRegistryPostSuccessResponse(deviceRegistryUrl, "/devices", [])
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

  describe("Updates to device rules", () => {
    beforeEach(() => {
      env.VI_SHOULD_UPDATE_DEVICE_RULES = "true"
      mockDeviceRegistryPostSuccessResponse(deviceRegistryUrl, "/devices", [])
      mockDeviceRegistryPutSuccess(
        deviceRegistryUrl,
        `${deviceRegistryDevicesEndpoint}/device-1`,
        {model: "450plus"},
        "ok"
      )
      mockDeviceRegistryPutSuccess(
        deviceRegistryUrl,
        `${deviceRegistryDevicesEndpoint}/device-1`,
        {model: "450x"},
        "ok"
      )
    })

    it("should update device rules only once if model of bike remains same", async () => {
      const events = [
        {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type", seq: 1},
        {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type", seq: 2}
      ]
      mockDeviceRulesPutSuccess({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-1/450plus`,
        numSuccesses: 1
      })

      const {updateDeviceInfo} = await getDeviceInfoHandler(appContext)

      await updateDeviceInfo(events[0])
      await updateDeviceInfo(events[1])

      expect(log.info).to.have.been.calledWithMatch(
        "Successfully updated device rules for device: device-1 with model: 450plus"
      )
      expect(log.warn.callCount).to.eql(0)
    })

    it("should update device rules if model of bike changes", async () => {
      const events = [
        {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type"},
        {device_uuid: "device-1", value: "GEN2_450x", data_item_name: "bike_type"}
      ]
      mockDeviceRulesPutSuccess({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-1/450plus`,
        numSuccesses: 1
      })
      mockDeviceRulesPutSuccess({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-1/450x`,
        numSuccesses: 1
      })

      const {updateDeviceInfo} = await getDeviceInfoHandler(appContext)
      return Promise.all(events.map(updateDeviceInfo)).then(() => {
        expect(log.info).to.have.been.calledWithMatch(
          "Successfully updated device rules for device: device-1 with model: 450plus"
        )
        expect(log.info).to.have.been.calledWithMatch(
          "Successfully updated device rules for device: device-1 with model: 450x"
        )
        expect(log.warn.callCount).to.eql(0)
      })
    })

    it("if device rules request fails with non-retryable error, should retry updating devices rules on subsequent model event", async () => {
      const events = [
        {device_uuid: "device-1", value: "GEN2_450x", data_item_name: "bike_type"},
        {device_uuid: "device-1", value: "GEN2_450x", data_item_name: "bike_type"}
      ]
      mockDeviceRulesPutSuccessAfterFailure({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-1/450x`,
        failureStatusCode: 400,
        numFailures: 1
      })

      const {updateDeviceInfo} = await getDeviceInfoHandler(appContext)
      return Promise.all(events.map(updateDeviceInfo)).then(() => {
        expect(log.warn).to.have.been.calledWithMatch("Failed to update rules for device: device-1 with model: 450x")
        expect(log.info).to.have.been.calledWithMatch(
          "Successfully updated device rules for device: device-1 with model: 450x"
        )
      })
    })

    it("should retry if device rules request fails with retryable error", async () => {
      const events = [{device_uuid: "device-1", value: "GEN2_450x", data_item_name: "bike_type"}]
      mockDeviceRulesPutSuccessAfterFailure({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-1/450x`,
        failureStatusCode: 503,
        numFailures: 2 // 2 is the max number of retries in retry config
      })

      const {updateDeviceInfo} = await getDeviceInfoHandler(appContext)
      return Promise.all(events.map(updateDeviceInfo)).then(() => {
        expect(log.info).to.have.been.calledWithMatch(
          "Successfully updated device rules for device: device-1 with model: 450x"
        )
      })
    })

    it("should not update device rules if model is invalid", async () => {
      const event = {device_uuid: "device-1", data_item_name: "bike_type"}
      const {updateDeviceInfo} = await getDeviceInfoHandler(appContext)
      await updateDeviceInfo(event)
    })
  })

  describe("Updates to device rules and device registry", () => {
    beforeEach(() => {
      mockDeviceRegistryPostSuccessResponse(deviceRegistryUrl, "/devices", [])
      env.VI_SHOULD_UPDATE_DEVICE_RULES = "true"
    })

    it("retries and updates device rules and device registry correctly if both APIs are up", async () => {
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

    it("does not update device registry if device rules fails with non-retryable error", async () => {
      mockDeviceRulesPutFailure({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-1/450plus`,
        failureStatusCode: 400
      })
      mockDeviceRegistryPutSuccess(
        deviceRegistryUrl,
        `${deviceRegistryDevicesEndpoint}/device-1`,
        {model: "450plus"},
        "ok"
      )

      const event = {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type"}

      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)
      await updateDeviceInfo(event)
      expect(getUpdatedDeviceModelMapping()).to.eql({})
      expect(log.warn.callCount).to.eql(1)
      expect(log.warn).to.have.been.calledWithMatch("Failed to update rules for device: device-1 with model: 450plus")
    })

    it("updates only device rules if device registry fails with non-retryable error", async () => {
      mockDeviceRulesPutSuccess({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-1/450plus`,
        numSuccesses: 2
      })

      mockDeviceRegistryPutSuccessAfterFailure(
        deviceRegistryUrl,
        `${deviceRegistryDevicesEndpoint}/device-1`,
        {model: "450plus"},
        400,
        1,
        "ok"
      )

      const event = {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type"}

      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)

      await updateDeviceInfo(event)
      expect(getUpdatedDeviceModelMapping()).to.eql({})
      expect(log.warn.callCount).to.eql(1)
      expect(log.warn).to.have.been.calledWithMatch(
        "Failed to update device model mapping for device: device-1 with model: 450plus"
      )

      await updateDeviceInfo(event)
      expect(getUpdatedDeviceModelMapping()).to.eql({
        "device-1": "450plus"
      })
      expect(log.warn.callCount).to.eql(1)

      sinon.assert.calledWithMatch(
        log.info.getCall(3),
        "Successfully updated device rules for device: device-1 with model: 450plus"
      )
      sinon.assert.calledWithMatch(
        log.info.getCall(5),
        "Successfully updated device rules for device: device-1 with model: 450plus"
      )
    })

    it("updates device rules for existing device if force update rules is enabled and on model dataitem", async () => {
      nock.cleanAll()
      process.env.VI_FORCE_UPDATE_DEVICE_RULES = "true"

      // If response is empty, test will fail as we will try to update device registry which will fail as we haven't mocked device registry API
      mockDeviceRegistryPostSuccessResponse(deviceRegistryUrl, "/devices", [{device: "device-1", model: "450plus"}])
      mockDeviceRulesPutSuccess({
        baseUrl: deviceRulesUrl,
        putUrl: `${deviceRulesDeviceEndpoint}/device-1/450plus`,
        numSuccesses: 1
      })

      const event = {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "bike_type"}

      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)

      await updateDeviceInfo(event)

      expect(getUpdatedDeviceModelMapping()).to.eql({
        "device-1": "450plus"
      })

      expect(log.info).to.have.been.calledWithMatch(
        "Successfully updated device rules for device: device-1 with model: 450plus"
      )

      expect(log.warn.callCount).to.eql(0)

      delete process.env.VI_FORCE_UPDATE_DEVICE_RULES
    })

    it("don't update device rules for existing device if force update rules is enabled for non model dataitem", async () => {
      nock.cleanAll()
      process.env.VI_FORCE_UPDATE_DEVICE_RULES = "true"

      mockDeviceRegistryPostSuccessResponse(deviceRegistryUrl, "/devices", [{device: "device-1", model: "450plus"}])

      const event = {device_uuid: "device-1", value: "GEN2_450plus", data_item_name: "foo"}

      const {updateDeviceInfo, getUpdatedDeviceModelMapping} = await getDeviceInfoHandler(appContext)

      await updateDeviceInfo(event)

      expect(getUpdatedDeviceModelMapping()).to.eql({
        "device-1": "450plus"
      })

      expect(log.warn.callCount).to.eql(0)

      delete process.env.VI_FORCE_UPDATE_DEVICE_RULES
    })
  })
})
