import fs from "fs"
import {getDecompresserFn} from "../../src/messageParser/decompressMessage"
import {log} from "../stubs/logger"
import {clearEnv} from "../utils"

const {env} = process
describe("Decompresses gcp message", () => {
  afterEach(() => {
    clearEnv()
  })

  describe("Post big sink data", () => {
    it("uses zlib unzip", () => {})
  })

  describe("Pre big sink data", () => {
    it("uses zlib deflate non-v1 data", () => {})

    it("uses avro deserialization for v1", async () => {
      env.VI_PRE_BIG_SINK_INPUT = "true"
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/MCU`))
      const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
      const decompressMessage = getDecompresserFn({log})
      const output = await decompressMessage(message)
      expect(output.data.length).to.eql(10)
    })

    it("puts can info under can raw and handles long type without precision loss when deserializing avro", async () => {
      env.VI_PRE_BIG_SINK_INPUT = "true"
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/CAN_MCU`))
      const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
      const decompressMessage = getDecompresserFn({log})
      const output = await decompressMessage(message)
      expect(output.data.length).to.eql(100)
      output.data.forEach(e => {
        expect(Object.keys(e.canRaw).length).to.eql(4)
      })
    })

    it("logs error and returns null if unable to deserialize avro", () => {})
  })

  it("returns message as is if compresssion flag is false", () => {})
})
