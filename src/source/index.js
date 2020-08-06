import gcp from "./gcp"
import kafka from "./kafka"

export const getSourceStream = appContext => {
  const sourceMode = process.env.VI_ATHER_COLLECTOR_SOURCE_MODE || "gcp"
  if (sourceMode === "gcp") {
    return gcp(appContext)
  }
  return kafka(appContext)
}
