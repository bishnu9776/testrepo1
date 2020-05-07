/**
 *  This script is too convert the text snippet to json config
 *  input sample (Device specific and default mapping: https://systeminsights.jira.com/wiki/spaces/ATHER/pages/868516048/Parsers)
 *  Update inputFilePath and outputFilePath with respective file paths.
 *  Remove extra bracket ")" at the end of default config in config txt if present.
 *  [eg: DEFAULT" to Components("MAHLEX1", "MK3", "v4_1_0", "v1_0_0", "LPCv1")) - remove the last bracket ]
 *  Values in Components are in the order (can_motor, can_charger, can_bms, can_mcu, can_pod)
*/

import readline from 'readline'
import fs from "fs"

const inputFilePath = "path/to/file/name.txt"
const readLineInterface = readline.createInterface({
  input: fs.createReadStream(inputFileName)
})

const deviceKeyRegex = new RegExp("(.*) to" )
const componentRegex = new RegExp("Components\\((.*)\\)")
const formatComponent = str => str.replace("(", "").split(",")
const componentKeysLength = 5
const parse = (str) => JSON.parse(str)
const defaultConfig = {}

const createLegacyComponentVersionConfig = (line) => {
  const deviceKey = JSON.parse(deviceKeyRegex.exec(line)[1])
  defaultConfig[deviceKey] = {}

  const components = formatComponent(componentRegex.exec(line)[1])

  defaultConfig[deviceKey] = {
    "can_motor": parse(components[0]),
    "can_charger": parse(components[1]),
    "can_bms": parse(components[2]),
    "can_mcu": parse(components[3]),
    "can_pod": parse(components[4])
  }
}

readLineInterface.on('line', line => {
  createLegacyComponentVersionConfig(line)
})

const outputFilePath = "path/to/file/output.json"

readLineInterface.on('close', () => {
  fs.writeFileSync(outputFilePath, JSON.stringify(defaultConfig, null, 2), {flag: "w"})
})
