import {formatData} from "../src/formatData/formatData"
import probe from "./mocks/probe.json"
import {MCU} from "./mocks/MCU"
import {ACK_MSG_TAG} from "../src/constants"

describe.skip("Format data", () => {
  const log = sinon.stub({
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {}
  })
  const metricRegistry = sinon.stub({
    updateStat: () => {}
  })

  before(() => {
    process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG = "false"
  })

  after(() => {
    delete process.env.VI_GCP_PUBSUB_DATA_COMPRESSION_FLAG
  })

  it("dedups events", async () => {
    const message = {data: Buffer.from(JSON.stringify(MCU.data)), attributes: MCU.attributes}
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
