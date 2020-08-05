import gcp from "./gcp"

export const getSourceStream = appContext => {
  const sourceMode = process.env.VI_ATHER_COLLECTOR_SOURCE_MODE || "gcp"
  if (sourceMode === "gcp") {
    return gcp(appContext)
  }
}
