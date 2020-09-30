import {Observable} from "rxjs"
import {take, toArray} from "rxjs/operators"
import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"
import {clearStub} from "../../stubs/clearStub"
import {getMockLog} from "../../stubs/logger"
import {kafkaStream} from "../../../src/source/kafka/kafkaStream"
import kafkaEvent from "../../fixtures/kafkaEvent.json"
import {clearEnv} from "../../utils"

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

  it("throw error when device is not present", done => {
    const topicBuffer = JSON.stringify(Buffer.from(".devices"))
    const kafkaInputWithoutDevice = {
      ...kafkaEvent,
      headers: [
        {
          inputTopic: {
            data: topicBuffer
          }
        }
      ]
    }
    const kafkaInput = getKafkaInput(kafkaInputWithoutDevice)
    let getKafkaStream
    const stream = new Observable(observer => {
      getKafkaStream = kafkaStream(appContext, observer)
    })
    stream.subscribe()
    getKafkaStream([kafkaInput]).then(() => {
      expect(appContext.log.warn).to.have.been.calledOnce
      expect(appContext.metricRegistry.updateStat).to.have.been.calledWith(
        "Counter",
        "num_events_dropped",
        1,
        "invalid_attributes"
      )
      done()
    })
  })

  it("throw error when channel is not present", done => {
    const topicBuffer = JSON.stringify(Buffer.from(".devices.device-1.events.v1"))
    const kafkaInputWithoutChannel = {
      ...kafkaEvent,
      headers: [
        {
          inputTopic: {
            data: topicBuffer
          }
        }
      ]
    }
    const kafkaInput = getKafkaInput(kafkaInputWithoutChannel)
    let getKafkaStream
    const stream = new Observable(observer => {
      getKafkaStream = kafkaStream(appContext, observer)
    })
    stream.subscribe()

    // eslint-disable-next-line sonarjs/no-identical-functions
    getKafkaStream([kafkaInput]).then(() => {
      expect(appContext.log.warn).to.have.been.calledOnce
      expect(appContext.metricRegistry.updateStat).to.have.been.calledWith(
        "Counter",
        "num_events_dropped",
        1,
        "invalid_attributes"
      )
      done()
    })
  })

  it("throw error when parsing fails", done => {
    const kafkaInput = getKafkaInput(kafkaEvent)
    const inputWithInvalidData = {...kafkaInput, value: undefined}
    let getKafkaStream
    const stream = new Observable(observer => {
      getKafkaStream = kafkaStream(appContext, observer)
    })
    stream.subscribe()
    getKafkaStream([inputWithInvalidData]).then(() => {
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

  it("should send data in observable stream when there is a batch", () => {
    const topic2 = JSON.stringify(Buffer.from(".devices.device-2.events.v1.buffered"))
    const kafkaInput = getKafkaInput(kafkaEvent)
    const kafkaInput2 = getKafkaInput({
      ...kafkaEvent,
      headers: [
        {
          inputTopic: {
            data: topic2
          }
        }
      ]
    })
    let getKafkaStream
    const stream = new Observable(observer => {
      getKafkaStream = kafkaStream(appContext, observer)
    })

    stream.pipe(take(2), toArray()).subscribe(([event1, event2]) => {
      expect(event1.message.attributes.deviceId).to.eql("device-1")
      expect(event1.message.attributes.subFolder).to.eql("v1/logs")
      expect(event1.acknowledgeMessage).to.exist
      expect(event2.message.attributes.deviceId).to.eql("device-2")
      expect(event2.message.attributes.subFolder).to.eql("v1/buffered")
      expect(event2.acknowledgeMessage).to.exist
    })

    getKafkaStream([kafkaInput, kafkaInput2])
  })
})
