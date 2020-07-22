import EventEmitter from "events"
import {PubSub} from "@google-cloud/pubsub"
import {getGCPStream} from "../../src/gcpSubscriber/gcpStream"
import {getMockLog} from "../stubs/logger"
import {getMockMetricRegistry} from "../stubs/getMockMetricRegistry"
import {clearStub} from "../stubs/clearStub"

describe("GCP subscriber", () => {
  let appContext

  beforeEach(() => {
    appContext = {
      log: getMockLog(),
      metricRegistry: getMockMetricRegistry()
    }
  })

  afterEach(() => {
    clearStub()
  })
  it("sends data/error on observable stream", done => {
    const eventEmitter = new EventEmitter()
    const actualEvents = []
    eventEmitter.close = () => {
      return new Promise(() => {
        try {
          expect(actualEvents).to.deep.eql([{a: 1}, {b: 1}])
          done()
        } catch (e) {
          done(e)
        }
      })
    }

    sinon.stub(PubSub.prototype, "subscription").callsFake(() => {
      return eventEmitter
    })

    getGCPStream(appContext).stream.subscribe({
      next: x => actualEvents.push(x),
      error: e => {
        expect(e.message).to.eql("Error on GCP")
      }
    })

    eventEmitter.emit("message", {a: 1})
    eventEmitter.emit("message", {b: 1})
    eventEmitter.emit("error", new Error("Error on GCP"))
  })
})
