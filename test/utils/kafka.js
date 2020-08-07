import Kafka from "node-rdkafka"

const topicAlreadyExistsExceptionErrorCode = 36
const unknownTopicExceptionErrorCode = 3

export const createTopic = async (kafkaUrl, topic, partitions) => {
  return new Promise((resolve, reject) => {
    const kafkaAdmin = Kafka.AdminClient.create({
      "client.id": "kafka-admin",
      "metadata.broker.list": kafkaUrl
    })

    kafkaAdmin.createTopic(
      {
        topic,
        num_partitions: partitions || 1,
        replication_factor: 1
      },
      err => {
        kafkaAdmin.disconnect()
        if (err && err.code !== topicAlreadyExistsExceptionErrorCode) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

export const deleteTopic = async (kafkaUrl, topic) => {
  return new Promise((resolve, reject) => {
    const kafkaAdmin = Kafka.AdminClient.create({
      "client.id": "kafka-admin",
      "metadata.broker.list": kafkaUrl
    })

    kafkaAdmin.deleteTopic(topic, 20000, err => {
      kafkaAdmin.disconnect()
      if (err && err.code !== unknownTopicExceptionErrorCode) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export const produceMessage = (producer, event, topic) => {
  return new Promise((resolve, reject) => {
    producer.produce(topic, null, Buffer.from(event), null, Date.now(), err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export const rawMessage = (message, topic, partition, offset) => ({
  offset,
  partition,
  topic,
  value: Buffer.from(JSON.stringify(message), "utf-8")
})
