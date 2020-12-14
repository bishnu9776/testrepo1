import {path, pipe} from "ramda"
import monitoring from "@google-cloud/monitoring"
import {errorFormatter} from "../utils/errorFormatter"

export const collectSubscriptionStats = ({appContext, credentialsPath, projectId, subscriptionName, statsInterval}) => {
  const {log, metricRegistry} = appContext
  const client = new monitoring.MetricServiceClient({keyFilename: credentialsPath})

  return setInterval(async () => {
    const request = {
      name: client.projectPath(projectId),
      filter: `metric.type="pubsub.googleapis.com/subscription/num_undelivered_messages" AND resource.labels.subscription_id="${subscriptionName}"`,
      interval: {
        startTime: {
          seconds: Date.now() / 1000 - 60 * 5 // going back 5 minutes
        },
        endTime: {
          seconds: Date.now() / 1000
        }
      }
    }

    try {
      const [timeSeries] = await client.listTimeSeries(request)
      const getStartTime = pipe(path(["interval", "startTime", "seconds"]), parseInt)

      timeSeries.forEach(ts => {
        const points = ts.points.sort((a, b) => getStartTime(b) - getStartTime(a)) // descending
        if (!points.length) {
          return
        }
        const point = points[0] && points[0].value // because sorted by descending order
        const value = point[point.value]
        metricRegistry.updateStat("Gauge", "num_undelivered_messages", value, {
          subscription: path(["resource", "labels", "subscription_id"], ts)
        })
      })
    } catch (e) {
      log.warn({error: errorFormatter(e)}, "Could not get GCP subscription stats")
    }
  }, statsInterval)
}
