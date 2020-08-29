import {Observable} from "rxjs"
import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"
import {clearStub} from "../../stubs/clearStub"
import {getMockLog} from "../../stubs/logger"
import {kafkaStream} from "../../../src/source/kafka/kafkaStream"
import kafkaEvent from "../../fixtures/kafkaEvent.json"
import {clearEnv} from "../../utils"

const {env} = process

describe("Kafka Stream", () => {
  let appContext

  beforeEach(async () => {
    env.VI_KAFKA_SOURCE_DEVICE_REGEX = "\\..*\\.(.*)\\..*"
    appContext = {
      log: getMockLog(),
      metricRegistry: getMockMetricRegistry()
    }
  })

  afterEach(async () => {
    clearStub()
    clearEnv()
  })

  const getKafkaInput = event => ({
    ...event,
    value: Buffer.from(event.value.data),
    headers: [
      {
        inputTopic: Buffer.from(event.headers[0].inputTopic.data)
      }
    ],
    key: Buffer.from(event.key.data)
  })

  it("send data on observable stream", () => {
    const stream = new Observable(observer => {
      const kafkaInput = getKafkaInput(kafkaEvent)
      kafkaStream(appContext, observer)(kafkaInput)
    })

    stream.subscribe(event => {
      expect(event.message.data).to.eql(kafkaEvent.value.data)
      expect(event.message.attributes.deviceId).to.eql("foo")
    })
  })

  it("throw error when regex doesnt match any device", done => {
    // inputTopic = "/a/b/c"
    const kafkaInputWithWrongTopic = {...kafkaEvent, headers: [{inputTopic: {data: [47, 97, 47, 98, 47, 99]}}]}
    const stream = new Observable(observer => {
      const kafkaInput = getKafkaInput(kafkaInputWithWrongTopic)
      kafkaStream(
        appContext,
        observer
      )(kafkaInput).then(() => {
        expect(appContext.log.warn).to.have.been.calledOnce
        expect(appContext.metricRegistry.updateStat).to.have.been.calledWith(
          "Counter",
          "num_events_dropped",
          1,
          "regex_mismatch"
        )
        done()
      })
    })

    stream.subscribe()
  })

  it("throw error when parsing fails", done => {
    const stream = new Observable(observer => {
      const kafkaInput = getKafkaInput(kafkaEvent)
      const inputWithInvalidData = {...kafkaInput, value: undefined}
      kafkaStream(
        appContext,
        observer
      )(inputWithInvalidData).then(() => {
        expect(appContext.log.warn).to.have.been.calledOnce
        expect(appContext.metricRegistry.updateStat).to.have.been.calledWith(
          "Counter",
          "num_events_dropped",
          1,
          "parse_failure"
        )
        done()
      })
    })

    stream.subscribe()
  })
})
