import {getRoutingConfig, getTopics} from "../../src/kafkaProducer/routingUtils"
import {clearEnv} from "../utils"

describe("should route the events based on routing config", () => {
  const {env} = process

  beforeEach(() => {
    env.VI_DATAITEM_WHITELIST = "mcu"
    env.VI_CANRAW_DATAITEM_WHITELIST = "can_raw"
  })

  afterEach(() => {
    clearEnv()
  })
  it("should route can_raw to canRawTopics alone", () => {
    const routes = getRoutingConfig()
    const event = {
      tag: "MTConnectDataItems",
      data_item_name: "can_raw",
      attributes: {channel: "can_raw", version: "v1", bike_id: "BMS-EOL5"},
      device_uuid: "BMS-EOL5",
      timestamp: "2020-07-21T08:58:19.501Z",
      values: {
        can_id: 306,
        data: "-2621409860442463330",
        timestamp: 1595321899.501,
        seq_num: 1509075,
        global_seq: "49719812"
      }
    }
    const topics = getTopics(event, routes)
    expect(topics).to.eql(["test-canraw-topic-ather"])
  })

  it("should route whitelisted dataitem to archive and data topic", () => {
    const routes = getRoutingConfig()
    const event = {
      tag: "MTConnectDataItems",
      data_item_name: "mcu",
      attributes: {channel: "can_raw", version: "v1", bike_id: "BMS-EOL5"},
      device_uuid: "BMS-EOL5",
      timestamp: "2020-07-21T08:58:19.501Z",
      value: "foo"
    }
    const topics = getTopics(event, routes)
    expect(topics).to.eql(["test-topic-ather", "test-archive-topic-ather"])
  })

  it("should route non whitelisted and non canraw dataitem to archive topic alone", () => {
    const routes = getRoutingConfig()
    const event = {
      tag: "MTConnectDataItems",
      data_item_name: "vcu",
      attributes: {channel: "can_raw", version: "v1", bike_id: "BMS-EOL5"},
      device_uuid: "BMS-EOL5",
      timestamp: "2020-07-21T08:58:19.501Z",
      value: "foo"
    }
    const topics = getTopics(event, routes)
    expect(topics).to.eql(["test-archive-topic-ather"])
  })
})
