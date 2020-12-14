import {omit} from "ramda"
import {getRoutingConfig, getTopics} from "../../src/kafkaProducer/routingUtils"
import {clearEnv} from "../utils"

describe("should route the events based on routing config", () => {
  const {env} = process

  beforeEach(() => {
    env.VI_DATAITEM_WHITELIST = "mcu"
    env.VI_CANRAW_DATAITEM_WHITELIST = "can_raw"
    env.VI_KAFKA_SINK_DATA_TOPICS = "test-topic-ather"
    env.VI_KAFKA_SINK_ARCHIVE_TOPICS = "test-archive-topic-ather"
    env.VI_KAFKA_SINK_CANRAW_TOPICS = "test-canraw-topic-ather"
    env.VI_KAFKA_SINK_PROBE_TOPICS = "test-probe-topic-ather"
    env.VI_KAFKA_SINK_HEMAN_TOPICS = "test-heman-topic"
  })

  afterEach(() => {
    clearEnv()
  })

  const event = {
    tag: "MTConnectDataItems",
    data_item_name: "can_raw",
    attributes: {channel: "can_raw", version: "v1", bike_id: "BMS-EOL5"},
    device_uuid: "BMS-EOL5",
    timestamp: "2020-07-21T08:58:19.501Z",
    value: "foo"
  }

  it("should route can_raw to canRawTopics alone", () => {
    const topics = getTopics(event, getRoutingConfig())
    expect(topics).to.eql(["test-canraw-topic-ather"])
  })

  it("should route whitelisted dataitem to archive and data topic", () => {
    const topics = getTopics({...event, data_item_name: "mcu"}, getRoutingConfig())
    expect(topics).to.eql(["test-topic-ather", "test-archive-topic-ather"])
  })

  it("should route non whitelisted and non canraw dataitem to archive topic alone", () => {
    const topics = getTopics({...event, data_item_name: "vcu"}, getRoutingConfig())
    expect(topics).to.eql(["test-archive-topic-ather"])
  })

  it("should route probe events to probe topic alone", () => {
    const topics = getTopics({...event, tag: "MTConnectDevices", data_item_name: "foo"}, getRoutingConfig())
    expect(topics).to.eql(["test-probe-topic-ather"])
  })

  it("should write error_code events to archive and heman topic", () => {
    const topics = getTopics(omit(["attributes"], {...event, data_item_name: "error_code"}), getRoutingConfig())
    expect(topics).to.eql(["test-archive-topic-ather", "test-heman-topic"])
  })
})
