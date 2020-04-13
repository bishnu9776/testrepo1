import {errorFormatter} from "../utils/errorFormatter"
import {delayAndExit} from "../utils/delayAndExit"

export const loadProbe = (filePath, log) => {
  try {
    return require(filePath) // eslint-disable-line global-require, import/no-dynamic-require
  } catch (e) {
    log.error({error: errorFormatter(e)}, "Could not load probe. Exiting process")
    delayAndExit(3)
  }
}
