import fs from "fs"
import path from "path"
import {difference} from "ramda"
import {getMessageParser} from "../../src/messageParser"
import probe from "../fixtures/bike-probe.json"
import {ACK_MSG_TAG} from "../../src/constants"
import {getDeflateCompressedGCPEvent} from "../utils/getMockGCPEvent"
import {getMockLog} from "../stubs/logger"
import {clearEnv, setChannelDecoderConfigFileEnvs, setEnv, setGen2Envs} from "../utils"
import {GPSTPV} from "./fixtures/bikeChannels/GPSTPV"
import {getMockMetricRegistry} from "../stubs/getMockMetricRegistry"
import {clearStub} from "../stubs/clearStub"
import {getAttributesFormatter} from "../../src/messageParser/formatAttributes"

const formatAttributes = getAttributesFormatter(getMockMetricRegistry())

describe("Parse GCP message", () => {
  let appContext
  const parsedGCPEvents = [
    {
      data_item_id: "location-v1",
      data_item_name: "location",
      data_item_type: "LOCATION",
      device_uuid: "s_248",
      mode: 3,
      sequence: 290929,
      timestamp: "2019-10-05T18:27:04.164Z",
      value: {
        lat: 12.910605,
        lon: 77.60284
      },
      channel: "gps_tpv"
    },
    {
      channel: "gps_tpv",
      data_item_id: "mode-v1",
      data_item_name: "mode",
      device_uuid: "s_248",
      sequence: 290929,
      timestamp: "2019-10-05T18:27:04.164Z",
      value: 3
    },
    {
      channel: "gps_tpv",
      data_item_id: "lat_deg-v1",
      data_item_name: "lat_deg",
      device_uuid: "s_248",
      sequence: 290929,
      timestamp: "2019-10-05T18:27:04.164Z",
      value: 12.910605
    },
    {
      channel: "gps_tpv",
      data_item_id: "lon_deg-v1",
      data_item_name: "lon_deg",
      device_uuid: "s_248",
      sequence: 290929,
      timestamp: "2019-10-05T18:27:04.164Z",
      value: 77.60284
    }
  ]
  const acknowledgeMessage = () => {}

  beforeEach(() => {
    appContext = {
      metricRegistry: getMockMetricRegistry(),
      log: getMockLog()
    }
  })

  afterEach(() => {
    clearStub()
    clearEnv()
  })

  describe("gen1 parsing", () => {
    beforeEach(() => {
      setEnv({
        preBigSinkInput: "true",
        shouldDecodeMessage: "true",
        gcpPubsubDataCompressionFlag: "true",
        gen1DataitemIdVersion: "v1"
      })
      setChannelDecoderConfigFileEnvs()
    })

    afterEach(() => {
      clearEnv()
    })

    it("formats attributes for legacy data and parses correctly", async () => {
      const messageParser = getMessageParser({appContext, probe})
      const message = getDeflateCompressedGCPEvent({
        data: GPSTPV.data,
        attributes: formatAttributes({subFolder: GPSTPV.attributes.channel, deviceId: GPSTPV.attributes.bike_id})
      })
      const output = await messageParser({message, acknowledgeMessage})
      const expected = parsedGCPEvents
        .map(x => ({...x, data_item_id: `${x.data_item_name}-v1`}))
        .concat({tag: ACK_MSG_TAG, message, acknowledgeMessage})

      expect(output).to.eql(expected)
    })

    it("formats attributes for v1 data and parses correctly for GPS_TPV", async () => {
      const messageParser = getMessageParser({appContext, probe})
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/GPS_TPV`))
      const message = {data: Buffer.from(input.data.data), attributes: formatAttributes(input.attributes)}
      const requiredKeys = [
        "channel",
        "data_item_id",
        "data_item_name",
        "device_uuid",
        "sequence",
        "timestamp",
        "value"
      ]
      const output = await messageParser({message, acknowledgeMessage})

      output.forEach(e => {
        if (e.tag !== ACK_MSG_TAG) {
          expect(difference(requiredKeys, Object.keys(e)).length).to.eql(0)
        }
      })
      expect(output.length).to.eql(277)
      expect(output[output.length - 1].tag).to.eql(ACK_MSG_TAG)
    })

    it("formats attributes for v1 data and parses correctly for CAN ", async () => {
      const messageParser = getMessageParser({appContext, probe})
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/CAN_MCU`))
      const message = {data: Buffer.from(input.data.data), attributes: formatAttributes(input.attributes)}
      const output = await messageParser({message, acknowledgeMessage})
      expect(output.length).to.eql(121)
      expect(output.filter(e => e.data_item_name === "can_raw").length).to.eql(100)
      expect(output.filter(e => e.channel === "can_mcu/v1_0_0" && e.data_item_name !== "can_raw").length).to.eql(20) // deduped can_mcu events
      expect(output[120].tag).to.eql(ACK_MSG_TAG)
    })

    it("formats attributes for v1 data and parses correctly for LOGS ", async () => {
      const messageParser = getMessageParser({appContext, probe})
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/LOGS`))
      const message = {data: Buffer.from(input.data.data), attributes: formatAttributes(input.attributes)}
      const output = await messageParser({message, acknowledgeMessage})
      expect(output.length).to.eql(13)
      expect(output[12].tag).to.eql(ACK_MSG_TAG)
    })

    it("formats attributes for v1 data and parses correctly for CAN_RAW ", async () => {
      const messageParser = getMessageParser({appContext, probe})
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/CAN_RAW`))
      const message = {data: Buffer.from(input.data.data), attributes: formatAttributes(input.attributes)}
      const output = await messageParser({message, acknowledgeMessage})
      expect(output.length).to.eql(186)
      expect(output[185].tag).to.eql(ACK_MSG_TAG)
    })

    it("it should log and ack the message if unable to parse", async () => {
      const messageParser = getMessageParser({appContext, probe})
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/UNPARSABLE_LOGS`))
      const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
      const output = await messageParser({message, acknowledgeMessage})
      expect(output.length).to.eql(1)
      expect(output[0].tag).to.eql(ACK_MSG_TAG)
      expect(appContext.metricRegistry.updateStat).to.have.been.calledWith("Counter", "decompress_failures", 1, {})
    })
  })

  describe("gen2 parsing", () => {
    const pathToFixtures = path.join(process.cwd(), "test/fixtures")
    beforeEach(() => {
      setGen2Envs()
    })

    afterEach(() => {
      clearEnv()
    })

    it("formats attributes for v1 data and parses correctly for GEN2 ", async () => {
      const messageParser = getMessageParser({appContext, probe})
      const input = JSON.parse(fs.readFileSync(`${pathToFixtures}/avro/GEN_2`))
      const message = {data: Buffer.from(input.value.data), attributes: formatAttributes(input.attributes)}
      const output = await messageParser({message, acknowledgeMessage})
      expect(output.length).to.eql(2)
      expect(output[output.length - 1].tag).to.eql(ACK_MSG_TAG)
      expect(output[0].data_item_id).to.eql("s_123-BMS_Cell3")
    })
  })
})
