import {Observable} from "rxjs"
import {getMockMetricRegistry} from "../../stubs/getMockMetricRegistry"
import {clearStub} from "../../stubs/clearStub"
import {getMockLog} from "../../stubs/logger"
import {kafkaStream} from "../../../src/source/kafka/kafkaStream"
import kafkaEvent from "../../fixtures/kafkaEvent.json"
import {clearEnv} from "../../utils"

describe.skip("Kafka Stream", () => {
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

  it("send data on observable stream", () => {
    const stream = new Observable(observer => {
      const kafkaInput = getKafkaInput(kafkaEvent)
      kafkaStream(appContext, observer)([kafkaInput])
    })

    stream.subscribe(event => {
      expect(event.message.data).to.eql(Buffer.from(kafkaEvent.value.data))
      expect(event.message.attributes.deviceId).to.eql("device-1")
      expect(event.message.attributes.subFolder).to.eql("v1/logs")
    })
    stream.subscribe()
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
    const stream = new Observable(observer => {
      const kafkaInput = getKafkaInput(kafkaInputWithoutDevice)
      kafkaStream(
        appContext,
        observer
      )([kafkaInput]).then(() => {
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

    stream.subscribe()
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
    const stream = new Observable(observer => {
      const kafkaInput = getKafkaInput(kafkaInputWithoutChannel)
      kafkaStream(
        appContext,
        observer
        // eslint-disable-next-line sonarjs/no-identical-functions
      )([kafkaInput]).then(() => {
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

    stream.subscribe()
  })

  it("throw error when parsing fails", done => {
    const stream = new Observable(observer => {
      const kafkaInput = getKafkaInput(kafkaEvent)
      const inputWithInvalidData = {...kafkaInput, value: undefined}
      kafkaStream(
        appContext,
        observer
      )([inputWithInvalidData]).then(() => {
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
