import {Observable} from "rxjs"
import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"
import {clearStub} from "../../stubs/clearStub"
import {getMockLog} from "../../stubs/logger"
import {getKafkaStream} from "../../../src/source/kafka/getKafkaStream"
import kafkaEvent from "../../fixtures/kafkaEvent.json"

describe("Kafka Stream", () => {
  let appContext

  beforeEach(async () => {
    appContext = {
      log: getMockLog(),
      metricRegistry: getMockMetricRegistry()
    }
  })

  afterEach(async () => {
    clearStub()
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

  it("send data on observable streamm", () => {
    const stream = new Observable(observer => {
      const kafkaInput = getKafkaInput(kafkaEvent)
      getKafkaStream(appContext, observer)(kafkaInput)
    })

    stream.subscribe(event => {
      expect(event.message.data).to.eql(kafkaEvent.value.data)
      expect(event.message.attributes.bike_id).to.eql(".devices.foo.bar")
    })
  })
})
