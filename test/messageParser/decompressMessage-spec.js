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

    // TODO: Update mock names

    it("handles long type without precision loss loss errors when deserializing avro", async () => {
      env.VI_PRE_BIG_SINK_INPUT = "true"
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/CAN_MCU`))
      const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
      const decompressMessage = getDecompresserFn({log})
      const output = await decompressMessage(message)
      expect(output.data.length).to.eql(100)
    })

    it("logs error and returns null if unable to deserialize avro", () => {})
  })

  it("returns message as is if compresssion flag is false", () => {})
})
