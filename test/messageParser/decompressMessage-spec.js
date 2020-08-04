import fs from "fs"
import {getDecompresserFn} from "../../src/messageParser/decompressMessage"
import {getMockLog} from "../stubs/logger"
import {clearEnv} from "../utils"
import {getDeflateCompressedGCPEvent} from "../utils/getMockGCPEvent"
import {GPSTPV} from "../fixtures/bikeChannels/GPSTPV"
import {getMockMetricRegistry} from "../stubs/getMockMetricRegistry"
import {clearStub} from "../stubs/clearStub"

describe("Decompresses gcp message", () => {
  let appContext

  beforeEach(() => {
    appContext = {
      metricRegistry: getMockMetricRegistry(),
      log: getMockLog()
    }
  })

  afterEach(() => {
    clearEnv()
    clearStub()
  })

  describe("legacy data", () => {
    it("uses zlib inflate", async () => {
      const input = getDeflateCompressedGCPEvent({data: GPSTPV.data, attributes: {subFolder: "gpstpv"}})
      const decompressMessage = getDecompresserFn(appContext)
      const output = await decompressMessage(input)
      expect(output.length).to.eql(1)
      expect(Object.keys(output[0]).length).to.eql(8)
    })
  })

  describe("v1", () => {
    it("uses avro deserialization", async () => {
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/MCU`))
      const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
      const decompressMessage = getDecompresserFn(appContext)
      const output = await decompressMessage(message)
      expect(output.length).to.eql(10)
    })

    it("handles long type without precision loss when deserializing avro", async () => {
      const input = JSON.parse(fs.readFileSync(`${process.cwd()}/test/fixtures/avro/CAN_MCU`))
      const message = {data: Buffer.from(input.data.data), attributes: input.attributes}
      const decompressMessage = getDecompresserFn(appContext)
      const output = await decompressMessage(message)
      expect(output.length).to.eql(100)
      output.forEach(e => {
        expect(Object.keys(e).length).to.eql(4)
      })
    })
  })
})
