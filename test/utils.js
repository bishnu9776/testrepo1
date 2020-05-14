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

export const setChannelDecoderConfigFileEnvs = () => {
  const {env} = process
  env.VI_CAN_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/canDecoderConfig.json"
  env.VI_CAN_LEGACY_COMPONENT_VERSION_CONFIG_PATH = "./test/fixtures/configFiles/legacyComponentVersionConfig.json"
  env.VI_MCU_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/mcuDecoderConfig.js"
  env.VI_VCU_DECODER_CONFIG_PATH = "./test/fixtures/configFiles/vcuDecoderConfig.js"
}
