import {MetricRegistry} from "node-metric-registry"

const getMetricRegistry = log => {
  const statsInterval = parseInt(process.env.VI_STATS_INTERVAL, 10) || 10000
  const statsLogMessage = "Stats"
  return new MetricRegistry(log, statsInterval, statsLogMessage)
}

export {getMetricRegistry}
