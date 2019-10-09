import {bunyanLogger} from "node-microservice"

export const log = bunyanLogger({
  name: process.env.VI_NAME || "svc-ather-collector",
  version: process.env.VI_VERSION || "0.0.1",
  logLevel: process.env.VI_LOG_LEVEL || "info",
  logDir: process.env.VI_LOG_DIR
})
