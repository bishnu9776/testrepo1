describe("Integration spec", () => {
  describe("Writes events to Kafka successfully", () => {
    it("writes valid events to Kafka", () => {
      // getGCPStream
      // getKafkaProducer
      // pipeGCPStream to producer
      // consume event from kafka, mergeProbeInfo(event) and assert with expected events
    })

    it("ignore invalid events", () => {
      // falsy values
      // parse failures
      // decompress failures
    })

  })
})
