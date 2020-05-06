import fs from "fs"
import {getDecompresserFn} from "../../src/messageParser/decompressMessage"
import {log} from "../stubs/logger"
import {clearEnv} from "../utils"

const {env} = process
describe("Decompresses gcp message", () => {
  afterEach(() => {
    clearEnv()
  })

  it("uses zlib unzip for post big sink data", () => {})

  it("uses zlib deflate non-v1 pre big sink data", () => {})

  it("uses avro for v1 pre big sink data", async () => {
    env.VI_PRE_BIG_SINK_INPUT = "true"
    const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/MCU_WITHOUT_PRECISION_LOSS`))
    const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
    const decompressMessage = getDecompresserFn({log})
    const output = await decompressMessage(message)
    expect(output.length).to.eql(10)
  })

  it("handles precision loss errors when deserializing avro", async () => {
    env.VI_PRE_BIG_SINK_INPUT = "true"
    const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/CAN_MCU_WITH_PRECISION_LOSS`))
    const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
    const decompressMessage = getDecompresserFn({log})
    const output = await decompressMessage(message)
    expect(output.length).to.eql(10)
  })
})
