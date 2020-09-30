import {errorFormatter} from "./errorFormatter"
import {delayAndExit} from "./delayAndExit"

export const loadFileFromAbsolutePath = (filePath, log) => {
  try {
    return require(filePath) // eslint-disable-line global-require, import/no-dynamic-require
  } catch (e) {
    log.error({error: errorFormatter(e)}, `Could not load file from path ${filePath}. Exiting process`)
    delayAndExit(3)
  }
}
