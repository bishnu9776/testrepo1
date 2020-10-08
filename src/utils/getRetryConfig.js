import {isNil, path} from "ramda"

const {env} = process
const getIntegerConfig = ({envName, default: defaultConfig}) => {
  const config = process.env[envName]
  if (!isNil(config)) {
    return parseInt(config, 10)
  }
  return defaultConfig
}

const getIntegerConfigs = configs => {
  const configMap = {}
  configs.forEach(config => {
    configMap[config.name] = getIntegerConfig(config)
  })
  return configMap
}

export const addConfigIfAvailable = (object, keyValuePairs) => {
  let newObject = {...object}
  Object.keys(keyValuePairs).forEach(key => {
    const value = keyValuePairs[key]
    if (!isNil(value)) {
      newObject = {...newObject, [key]: value}
    }
  })
  return newObject
}

export const is5xxError = error => {
  const status = path(["response", "status"], error) || error.statusCode
  return status && status >= 500 && status < 600
}

export const getRetryConfig = (log, isRetryable) => {
  const {maxRetries, retryDelay, retryLogThreshold} = getIntegerConfigs([
    {
      name: "maxRetries",
      envName: "VI_ATHER_DEVICE_RULES_MAX_RETRIES",
      default: Number.POSITIVE_INFINITY
    },
    {
      name: "retryDelay",
      envName: "VI_ATHER_DEVICE_RULES_RETRY_DELAY"
    },
    {
      name: "retryLogThreshold",
      envName: "VI_ATHER_DEVICE_RULES_RETRY_LOG_THRESHOLD",
      default: 5
    }
  ])
  const exponentialRetry = JSON.parse(env.VI_ATHER_COLLECTOR_EXPONENTIAL_RETRY || "false")
  const retryConfig = addConfigIfAvailable({}, {maxRetries, exponentialRetry, retryDelay, retryLogThreshold})

  log.info({ctx: {retryConfig: JSON.stringify(retryConfig)}}, "API retry config")

  return {...retryConfig, isRetryable}
}
