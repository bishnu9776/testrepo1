import Convertor from "csvtojson"
import fs from "fs"
import path from "path"
import {omit} from "ramda"

const inputFileName = "ci-probe.csv"
const outputFileName = "ci-probe.json"

const csvpath = process.env.VI_PATH_TO_PROBE_CSV || path.join(__dirname, `${inputFileName}`)

Convertor()
.fromFile(csvpath)
  .then(json => {
    const keyedJson = keyByDataItemName(json)
    const probeFilePath = path.join(__dirname, `./${outputFileName}`)
    try {
      fs.writeFileSync(probeFilePath, JSON.stringify(keyedJson, null, 2), {flag: "w"})
    } catch (error) {
      console.error("Error writing probe json", error)
    }
  })
  .catch(error => {
    console.error("Error converting to JSON", error)
  })


function keyByDataItemName(jsonArray) {
  return jsonArray.reduce((acc, dataItem) => {
    acc[dataItem.data_item_name] = omit(["Ather comments", "Notes"], dataItem)
    return acc
  }, {})
}
