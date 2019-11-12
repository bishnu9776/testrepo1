import {MetricRegistry} from "node-metric-registry"

const getMetricRegistry = log => {
  const statsInterval = parseInt(process.env.VI_STATS_INTERVAL || "10000", 10)
  const statsLogMessage = "Stats"
  return new MetricRegistry(log, statsInterval, statsLogMessage)
}

export {getMetricRegistry}
