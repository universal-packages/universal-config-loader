import { mapObject } from '@universal-packages/object-mapper'
import { cleanOrphanReplaceable as cOR, evaluateAndReplace, replaceEnv } from '@universal-packages/variable-replacer'

import { deepMergeConfig } from './deepMergeConfig'

const COMMON_ENVS = ['default', 'development', 'production', 'staging', 'test']

/** Process loaded configuration replaces env variables and selects configurations by environment */
export function processConfig(baseConfig: any, cleanOrphanReplaceable?: boolean, environment?: string): any {
  const configKeys = Object.keys(baseConfig)
  let finalConfig: any = baseConfig

  // If configured select an environment from the loaded from file config
  if (environment) {
    if (COMMON_ENVS.includes(environment) || configKeys.includes(environment)) {
      finalConfig = deepMergeConfig({ ...baseConfig.default }, baseConfig[environment])
    }
  }

  // Map final options and replace values with env variables
  mapObject(finalConfig, null, (value: any): string => {
    let finalValue = value

    if (typeof value === 'string') {
      finalValue = replaceEnv(finalValue)
      finalValue = evaluateAndReplace(finalValue)
      if (cleanOrphanReplaceable) finalValue = cOR(finalValue)
    }

    return finalValue
  })

  return finalConfig
}
