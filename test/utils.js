import {snakeCase} from "snake-case"
import path from "path"

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

export const setGen2Envs = () => {
  const {env} = process
  const pathToFixtures = path.join(process.cwd(), "test/fixtures")

  env.VI_COLLECTOR_IS_GEN_2_DATA = "true"
  env.VI_COLLECTOR_VALUES_KEYS_MAPPING_PATH = `${pathToFixtures}/values_keys_mapping.json`
  env.VI_COLLECTOR_VALUES_SCHEMA_PATH = `${pathToFixtures}/values_schema.json`
}
