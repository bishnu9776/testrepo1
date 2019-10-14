import {formatData} from "../src/formatData/formatData"
import probe from "./mocks/probe.json"
import {MCU} from "./mocks/MCU"
import {ACK_MSG_TAG} from "../src/constants"
import {metricRegistry} from "./mocks/metricRegistry"
import {log} from "./mocks/logger"
import {getMockGCPEvent} from "./mocks/getMockGCPEvent"
import {BIKEINFO} from "./mocks/BIKEINFO"

describe("Format data", () => {
  before(() => {
    process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
  })

  after(() => {
    delete process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG
  })

  it("dedups events", async () => {
    const message = getMockGCPEvent(MCU)
    const output = (await formatData({log, metricRegistry, probe})(message)).filter(e => e.tag !== ACK_MSG_TAG)
    expect(output).to.eql([])
  })

  it("prod error", async () => {
    const message = getMockGCPEvent(BIKEINFO)
    const output = (await formatData({log, metricRegistry, probe})(message)).filter(e => e.tag !== ACK_MSG_TAG)
    expect(output).to.eql([])
  })

  it("adds id, data_item_id, data_item_name, device_uuid, value")
  it("decompresses")
  it("gives out array of messages")
  it("returns null if parse fails")
  it("returns null if decompress fails")
  it("adds ack message to end of array")
})
