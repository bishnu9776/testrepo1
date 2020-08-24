import fs from "fs"
import {difference} from "ramda"
import {getMessageParser} from "../../src/messageParser"
import probe from "../fixtures/probe.json"
import {ACK_MSG_TAG} from "../../src/constants"
import {getDeflateCompressedGCPEvent} from "../utils/getMockGCPEvent"
import {getMockLog} from "../stubs/logger"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../utils"
import {GPSTPV} from "../fixtures/bikeChannels/GPSTPV"
import {getMockMetricRegistry} from "../stubs/getMockMetricRegistry"
import {clearStub} from "../stubs/clearStub"

const {env} = process

describe("Parse GCP message", () => {
  let appContext

  beforeEach(() => {
    env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "true"
    appContext = {
      metricRegistry: getMockMetricRegistry(),
      log: getMockLog()
    }
  })

  afterEach(() => {
    clearEnv()
    clearStub()
  })

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

  describe("Pre big sink data", () => {
    const acknowledgeMessage = () => {}

    beforeEach(() => {
      env.VI_PRE_BIG_SINK_INPUT = "true"
      env.VI_SHOULD_DECODE_MESSAGE = true
      setChannelDecoderConfigFileEnvs()
    })

    afterEach(() => {
      clearEnv()
    })

    it("formats attributes for legacy data and parses correctly", async () => {
      const messageParser = getMessageParser({appContext, probe})
      const message = getDeflateCompressedGCPEvent({
        data: GPSTPV.data,
        attributes: {subFolder: GPSTPV.attributes.channel, deviceId: GPSTPV.attributes.bike_id}
      })
      const output = await messageParser({message, acknowledgeMessage})
      const expected = parsedGCPEvents
        .map(x => ({...x, data_item_id: `${x.data_item_name}-legacy`}))
        .concat({tag: ACK_MSG_TAG, message, acknowledgeMessage})
      expect(output).to.eql(expected)
    })

    it("formats attributes for v1 data and parses correctly for GPS_TPV", async () => {
      const messageParser = getMessageParser({appContext, probe})
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/GPS_TPV`))
      const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
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
      const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
      const output = await messageParser({message, acknowledgeMessage})
      expect(output.length).to.eql(21)
      expect(output[20].tag).to.eql(ACK_MSG_TAG)
    })

    it("formats attributes for v1 data and parses correctly for LOGS ", async () => {
      const messageParser = getMessageParser({appContext, probe})
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/LOGS`))
      const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
      const output = await messageParser({message, acknowledgeMessage})
      expect(output.length).to.eql(13)
      expect(output[12].tag).to.eql(ACK_MSG_TAG)
    })

    it("formats attributes for v1 data and parses correctly for CAN_RAW ", async () => {
      const messageParser = getMessageParser({appContext, probe})
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/CAN_RAW`))
      const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
      const output = await messageParser({message, acknowledgeMessage})
      expect(output.length).to.eql(186)
      expect(output[185].tag).to.eql(ACK_MSG_TAG)
    })

    it("formats attributes for v1 data and parses correctly for GEN2 ", async () => {
      process.env.IS_GEN_2_DATA = "true"
      const messageParser = getMessageParser({appContext, probe})
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/GEN_2`))
      const message = {data: Buffer.from(input.value.data), attributes: input.attributes}
      const output = await messageParser({message, acknowledgeMessage})
      expect(output.length).to.eql(4)
      expect(output[output.length - 1].tag).to.eql(ACK_MSG_TAG)
      delete process.env.IS_GEN_2_DATA
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

    describe("should ack message without decompressing or parsing", () => {
      it("when message contains channel specified to drop", async () => {
        env.VI_CHANNELS_TO_DROP = "gps_tpv"
        const messageParser = getMessageParser({appContext, probe})
        const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/GPS_TPV`))
        const message = {data: Buffer.from(input.data.data), attributes: {subFolder: "v1/gps_tpv"}}
        const output = await messageParser({message, acknowledgeMessage})
        expect(output.length).to.eql(1)
        expect(output[0].tag).to.eql(ACK_MSG_TAG)
      })

      it("when message contains bike_id which doesn't match the regex device filter", async () => {
        env.VI_SHOULD_FILTER_DEVICE = "true"
        env.VI_DEVICE_FILTER_REGEX = "00$"
        const messageParser = getMessageParser({appContext, probe})
        const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/GPS_TPV`))
        const message = {data: Buffer.from(input.data.data), attributes: {subFolder: "v1/gps_tpv", deviceId: "s_199"}}
        const output = await messageParser({message, acknowledgeMessage})
        expect(output.length).to.eql(1)
        expect(output[0].tag).to.eql(ACK_MSG_TAG)
      })
    })
  })
})
