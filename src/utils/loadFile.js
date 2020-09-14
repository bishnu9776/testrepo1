import path from "path"
import {errorFormatter} from "./errorFormatter"
import {log} from "../logger"

export const loadFile = filePath => {
  try {
    return require(path.resolve(filePath)) // eslint-disable-line global-require, import/no-dynamic-require
  } catch (e) {
    log.error({error: errorFormatter(e)}, `Could not load config file from path: ${filePath}`)
    return []
  }
}
