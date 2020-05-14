import fs from "fs"
import {difference} from "ramda"
import {getMessageParser} from "../../src/messageParser"
import probe from "../fixtures/probe.json"
import {ACK_MSG_TAG} from "../../src/constants"
import {metricRegistry} from "../stubs/metricRegistry"
import {getDeflateCompressedGCPEvent, getZipCompressedGCPEvent} from "../utils/getMockGCPEvent"
import {log} from "../stubs/logger"
import {clearEnv, setChannelDecoderConfigFileEnvs} from "../utils"
import {GPSTPV} from "../fixtures/bikeChannels/GPSTPV"

const {env} = process

describe("Parse GCP message", () => {
  beforeEach(() => {
    env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "true"
  })

  afterEach(() => {
    clearEnv()
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

  describe("post big sink data", () => {
    it("post big sink data - formats events and adds ack event to end of array", async () => {
      env.VI_PRE_BIG_SINK_INPUT = "false"
      const messageParser = getMessageParser({log, metricRegistry, probe})
      const message = getZipCompressedGCPEvent(GPSTPV)
      const output = await messageParser(message)
      expect(output).to.eql(parsedGCPEvents.concat({tag: ACK_MSG_TAG, message}))
    })
  })

  it("logs error and returns empty if unable to parse", async () => {
    const messageParser = getMessageParser({log, metricRegistry, probe})
    const output = await messageParser("foo")
    expect(output).to.eql([])
  })

  describe("Pre big sink data", () => {
    beforeEach(() => {
      env.VI_PRE_BIG_SINK_INPUT = "true"
      setChannelDecoderConfigFileEnvs()
    })

    it("formats attributes for legacy data and parses correctly", async () => {
      const messageParser = getMessageParser({log, metricRegistry, probe})
      const message = getDeflateCompressedGCPEvent({
        data: GPSTPV.data,
        attributes: {subFolder: GPSTPV.attributes.channel, deviceId: GPSTPV.attributes.bike_id}
      })
      const output = await messageParser(message)
      const expected = parsedGCPEvents
        .map(x => ({...x, data_item_id: `${x.data_item_name}-legacy`}))
        .concat({tag: ACK_MSG_TAG, message})
      expect(output).to.eql(expected)
    })

    it("formats attributes for v1 data and parses correctly", async () => {
      const messageParser = getMessageParser({log, metricRegistry, probe})
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
      const output = await messageParser(message)

      output.forEach(e => {
        if (e.tag !== ACK_MSG_TAG) {
          expect(difference(requiredKeys, Object.keys(e)).length).to.eql(0)
        }
      })
      expect(output.length).to.eql(277)
      expect(output[output.length - 1].tag).to.eql(ACK_MSG_TAG)
    })

    it("should return empty array if channel is logs", async () => {
      const messageParser = getMessageParser({log, metricRegistry, probe})
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/GPS_TPV`))
      const message = {data: Buffer.from(input.data.data), attributes: {...input.attributes, subFolder: "v1/logs"}}
      const output = await messageParser(message)
      expect(output).to.eql([])
    })
  })
})
