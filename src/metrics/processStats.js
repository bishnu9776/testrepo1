import eventLoopStats from "event-loop-stats"

export const collectProcessStats = ({metricRegistry, statsInterval}) => {
  return setInterval(() => {
    const {sum, max, num} = eventLoopStats.sense()
    metricRegistry.updateStat("Max", "max_event_loop_duration", max, {})
    metricRegistry.updateStat("Gauge", "average_event_loop_duration", sum / num, {})
  }, statsInterval)
}
