describe("Resiliency smoke tests", () => {
  describe("GCP resiliency", () => {
    it.skip("not able to connect on bootstrap", () => {
      // keeps retrying till successful connection
    })

    it.skip("loses connection after bootstrap", () => {
      // keeps retrying till successful connection
      // Getting UnhandledPromiseRejectionWarning, logging and ignoring for now
    })
  })

  describe("Kafka resiliency", () => {
    // we might get a queue full error if we get too many messages after decompression
    // can try tuning above by configuring max gcp internal buffer
    it.skip("not able to connect on bootstrap", () => {
      // keeps retrying till successful connection
    })

    it("loses connection after bootstrap", () => {
      // keeps retrying till successful connection
    })
  })

  describe("Pipeline resiliency", () => {
    it.skip("Pipeline resiliency - Error parsing event or somewhere between getting gcp event and producing to kafka")

    it.skip("Memory does not blow up by consuming too much from GCP", () => {
      // By limiting maxMessages in flow control settings, able to control consumption rate
    })
  })
})
