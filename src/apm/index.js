import apm from "elastic-apm-node/start"

const messageIdTransactionMap = {}
const messageIdSpansMap = {}

export const startTransaction = message => {
  const publishTimeMs = parseInt(parseFloat(message.publishTime.getFullTimeString()) / 1000000, 10)
  const messageId = message.id
  const channel = message.attributes.channel || message.attributes.subFolder

  const overallTransaction = apm.startTransaction("collector-end-to-end", {
    startTime: publishTimeMs
  })
  overallTransaction.setLabel("messageId", messageId)
  overallTransaction.setLabel("channel", channel)

  const networkDelaySpan = apm.startSpan("gcp-to-collector-delay", {
    childOf: overallTransaction.traceparent,
    startTime: publishTimeMs
  })

  networkDelaySpan.setLabel("messageId", messageId)
  networkDelaySpan.setType("gcp-to-collector-delay")
  networkDelaySpan.end(Date.now())

  messageIdTransactionMap[messageId] = overallTransaction
}

export const endTransaction = message => {
  const transaction = messageIdTransactionMap[message.id]
  if (transaction) {
    transaction.end(null, Date.now())
  }
}

export const startSpan = ({message, spanName, spanType, labels = {}}) => {
  const parentTransaction = messageIdTransactionMap[message.id]

  if (parentTransaction) {
    const span = apm.startSpan(spanName, {
      childOf: parentTransaction.traceparent,
      startTime: Date.now()
    })

    span.setType(spanType)
    span.setLabel("messageId", message.id)

    Object.keys(labels).forEach(label => {
      span.setLabel(label, labels[label])
    })

    messageIdSpansMap[`${message.id}.${spanName}`] = span
  }
}

export const endSpan = ({message, spanName, labels = {}}) => {
  const span = messageIdSpansMap[`${message.id}.${spanName}`]
  if (span) {
    Object.keys(labels).forEach(label => {
      span.setLabel(label, labels[label])
    })
    span.end(Date.now())
  }
}
