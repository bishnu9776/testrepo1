import Convertor from "csvtojson"
import fs from "fs"
import path from "path"

const csvpath = process.env.VI_PATH_TO_PROBE_CSV || path.join(__dirname, "/probe.csv")

Convertor()
.fromFile(csvpath)
  .then(json => {
    const probeFilePath = path.join(__dirname, "probe.json")
    try {
      fs.writeFileSync(probeFilePath, JSON.stringify(json, null, 2), {flag: "w"})
    } catch (error) {
      console.error("Error writing probe json", error)
    }
  })
  .catch(error => {
    console.error("Error converting to JSON", error)
  })
