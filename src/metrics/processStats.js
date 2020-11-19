import eventLoopStats from "event-loop-stats"

export const collectProcessStats = metricRegistry => {
  return setInterval(() => {
    const {sum, max, num} = eventLoopStats.sense()
    metricRegistry.updateStat("Max", "max_event_loop_duration", max, {})

    const averageEventLoopDuration = sum / num
    if (!Number.isNaN(averageEventLoopDuration)) {
      metricRegistry.updateStat("Gauge", "average_event_loop_duration", averageEventLoopDuration, {})
    }
  }, metricRegistry.statsInterval)
}
