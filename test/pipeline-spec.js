describe.skip("Pipeline spec", () => {
  it("writes valid events to Kafka and passes them through", () => {
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

  it("dedups events before writing to kafka")
})
