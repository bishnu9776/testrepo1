// read config txt file line by line,
// Take the first value in "" as component key, initiate empty object, format the component key
// remove extra bracket at the end of default config in config txt. (if present)
// Take the values in Components (), split by comma, add it to the key in order (can_motor, can_charger, can_bms, can_mcu, can_pod)

import readline from 'readline'
import fs from "fs"

const readInterface = readline.createInterface({
  input: fs.createReadStream('path/to/file/name.txt')
})

const defaultConfig = {}

const deviceKeyRegex = new RegExp("(.*) to" )
const componentRegex = new RegExp("Components\\((.*)\\)")
const formatComponent = str => str.replace("(", "").split(",")
const componentKeysLength = 5
const parse = (str) => JSON.parse(str)

const createDeviceLevelConfig = (line) => {
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

readInterface.on('line', line => {
  createDeviceLevelConfig(line)
})

readInterface.on('close', () => {
  fs.writeFileSync("path/to/file/output.json", JSON.stringify(defaultConfig, null, 2), {flag: "w"})
})
