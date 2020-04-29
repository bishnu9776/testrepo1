import fs from "fs"
import path from "path"
import {log} from "../logger"
import {errorFormatter} from "./errorFormatter"

export const loadJSONFile = filePath => {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"))
  } catch (e) {
    log.error({error: errorFormatter(e)}, `Error in reading JSON file ${filePath}.`)
    return {}
  }
}
