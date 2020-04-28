import fs from "fs"
import path from "path"
import {log} from "../logger"
import {errorFormatter} from "./errorFormatter"

export const loadDecoderConfig = decoderConfigPath => {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, decoderConfigPath), "utf8"))
  } catch (e) {
    log.error(
      {error: errorFormatter(e)},
      `Error in reading decoder configs ${decoderConfigPath}. Using an empty mapping.`
    )
    return {}
  }
}
