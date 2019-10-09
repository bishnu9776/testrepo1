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
    it.skip("does not blow up memory if processing is slow", () => {
      // set flow control settings (maxMessagesInProgress as 5)
      // have a huge setTimeout for every message before acking
      // observe memory of progress
      // observe how many times .on event handler is being called
    })
  })
})
