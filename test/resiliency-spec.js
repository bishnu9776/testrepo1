describe("Resiliency tests", () => {
  describe("Kafka resilience", () => {
    it("retries connection to Kafka based on retry policy")
    it("pauses source and does not consume events when retrying connection to Kafka")
    it("does not acknowledge events which aren't sent to Kafka")
  })

  describe("GCP resilience", () => {
    it("continuously tries to connect to GCP as per retry policy if not able to connect to GCP")
  })

  describe("Smoke tests", () => {
    describe("GCP resiliency", () => {
      it("on bootstrap, if unable to connect")

      it("loses connection after bootstrap", () => {
        // works but throws UnhandledPromiseRejectionWarning, should understand this
      })

      describe("Pipeline resiliency", () => {
        it.skip(
          "Pipeline resiliency - Error parsing event or somewhere between getting gcp event and producing to kafka"
        )

        it.skip("Memory does not blow up by consuming too much from GCP", () => {
          // By limiting maxMessages in flow control settings, able to control consumption rate
        })
      })

      // - disconnect wifi, have local kafka", () => {
      // after VI_GCP_PUBSUB_TIMEOUT seconds, error from gcp stream and we retry whole chain
      // set flow control settings (maxMessagesInProgress as 5)
      // have a huge setTimeout for every message before acking
      // observe memory of progress
      // observe how many times .on event handler is being called
    })
  })
})
