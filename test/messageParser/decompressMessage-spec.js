import fs from "fs"
import {getDecompresserFn} from "../../src/messageParser/decompressMessage"
import {log} from "../stubs/logger"
import {clearEnv} from "../utils"
import {getZipCompressedGCPEvent, getDecompressedGCPEvent, getDeflateCompressedGCPEvent} from "../utils/getMockGCPEvent"
import {CAN} from "../fixtures/bikeChannels/CAN"
import {GPSTPV} from "../fixtures/bikeChannels/GPSTPV"

const {env} = process
describe("Decompresses gcp message", () => {
  afterEach(() => {
    clearEnv()
  })

  describe("Post big sink", () => {
    it("uses zlib unzip", async () => {
      env.VI_PRE_BIG_SINK_INPUT = "false"
      const input = getZipCompressedGCPEvent(CAN)
      const decompressMessage = getDecompresserFn({log})
      const output = await decompressMessage(input)
      expect(output.length).to.eql(2)
      output.forEach(e => {
        expect(Object.keys(e.canRaw).length).to.eql(5)
        expect(e.parsed.length).to.eql(2)
      })
    })
  })

  describe("Pre big sink", () => {
    beforeEach(() => {
      env.VI_PRE_BIG_SINK_INPUT = "true"
    })

    describe("legacy data", () => {
      it("uses zlib deflate", async () => {
        const input = getDeflateCompressedGCPEvent({data: GPSTPV.data, attributes: {subFolder: "gpstpv"}})
        const decompressMessage = getDecompresserFn({log})
        const output = await decompressMessage(input)
        expect(output.length).to.eql(1)
        expect(Object.keys(output[0]).length).to.eql(8)
      })

      it("puts can info under canRaw", async () => {
        const CANRawData = CAN.data.map(x => x.canRaw)
        const input = getDeflateCompressedGCPEvent({
          data: CANRawData,
          attributes: {subFolder: "can_raw"}
        })
        const decompressMessage = getDecompresserFn({log})
        const output = await decompressMessage(input)
        expect(output.length).to.eql(2)
        output.forEach(e => {
          expect(Object.keys(e.canRaw).length).to.eql(5)
        })
      })
    })

    describe("v1", () => {
      it("uses avro deserialization", async () => {
        const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/MCU`))
        const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
        const decompressMessage = getDecompresserFn({log})
        const output = await decompressMessage(message)
        expect(output.length).to.eql(10)
      })

      it("puts can info under canRaw and handles long type without precision loss when deserializing avro", async () => {
        const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/CAN_MCU`))
        const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
        const decompressMessage = getDecompresserFn({log})
        const output = await decompressMessage(message)
        expect(output.length).to.eql(100)
        output.forEach(e => {
          expect(Object.keys(e.canRaw).length).to.eql(4)
        })
      })
    })
  })

  it("converts buffer to string if compression flag is false", async () => {
    env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
    const decompressMessage = getDecompresserFn({log})
    const output = await decompressMessage(getDecompressedGCPEvent({data: {foo: "bar"}, attributes: "baz"}))
    expect(output).to.eql({foo: "bar"})
  })
})
