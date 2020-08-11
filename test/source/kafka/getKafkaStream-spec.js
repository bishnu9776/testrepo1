import {Observable} from "rxjs"
import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"
import {clearStub} from "../../stubs/clearStub"
import {getMockLog} from "../../stubs/logger"
import {getKafkaStream} from "../../../src/source/kafka/getKafkaStream"
import kafkaEvent from "../../fixtures/kafkaEvent.json"
import {clearEnv} from "../../utils"

const {env} = process

describe("Kafka Stream", () => {
  let appContext

  beforeEach(async () => {
    env.VI_REGEX_DEVICE_FROM_TOPIC = "\\..*\\.(.*)\\..*"
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
      getKafkaStream(appContext, observer)(kafkaInput)
    })

    stream.subscribe(event => {
      expect(event.message.data).to.eql(kafkaEvent.value.data)
      expect(event.message.attributes.bike_id).to.eql("foo")
    })
  })

  it("throw error when regex doesnt match any device", done => {
    const stream = new Observable(observer => {
      const kafkaInputWithWrongTopic = {...kafkaEvent, headers: [{inputTopic: {data: [47, 97, 47, 98, 47, 99]}}]}
      const kafkaInput = getKafkaInput(kafkaInputWithWrongTopic)
      getKafkaStream(appContext, observer)(kafkaInput)
    })

    stream.subscribe({
      next: () => {
        expect(appContext.log.warn).to.have.been.calledOnce
        done()
      }
    })
  })
})
