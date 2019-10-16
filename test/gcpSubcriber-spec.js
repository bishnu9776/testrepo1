import EventEmitter from "events"
// import * as gcp from "@google-cloud/pubsub"
import {PubSub} from "@google-cloud/pubsub"
import {getGCPStream} from "../src/gcpSubscriber"
import {log} from "./mocks/logger"
import {metricRegistry} from "./mocks/metricRegistry"

describe("GCP subscriber", () => {
  it("sends data on an observable stream", done => {
    const eventEmitter = new EventEmitter()
    eventEmitter.close = () => {
      expect(actualEvents).to.deep.eql([{a: 1}, {b: 1}])
      done()
    }

    sinon.stub(PubSub.prototype, "subscription").callsFake(() => {
      return eventEmitter
    })

    const actualEvents = []
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
