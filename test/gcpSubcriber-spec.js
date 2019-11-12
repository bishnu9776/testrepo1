import EventEmitter from "events"
import {PubSub} from "@google-cloud/pubsub"
import {getGCPStream} from "../src/gcpSubscriber"
import {log} from "./mocks/logger"
import {metricRegistry} from "./mocks/metricRegistry"

describe("GCP subscriber", () => {
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

    getGCPStream({log, metricRegistry}).stream.subscribe({
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
