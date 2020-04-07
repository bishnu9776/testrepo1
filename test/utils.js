import {snakeCase} from "snake-case"

export const clearEnv = (prefix = "VI") => {
  Object.keys(process.env).forEach(key => {
    if (key.includes(prefix)) {
      delete process.env[key]
    }
  })
}

export const setEnv = config => {
  const envPrefix = "VI"

  Object.keys(config).forEach(k => {
    const envVar = snakeCase(k).toUpperCase()
    process.env[`${envPrefix}_${envVar}`] = config[k]
  })
}
