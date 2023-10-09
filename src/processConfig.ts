import { mapObject } from '@universal-packages/object-mapper'
import { cleanOrphanReplaceable as cOR, replaceEnv } from '@universal-packages/variable-replacer'

import { deepMergeConfig } from './deepMergeConfig'

/** Process loaded configuration replaces env variables and selects configurations by environment */
export function processConfig(baseConfig: any, cleanOrphanReplaceable?: boolean, environment?: string): any {
  const configKeys = Object.keys(baseConfig)
  let finalConfig: any = baseConfig

  // If configured select an environment from the loaded from file config
  if (environment) {
    if (configKeys.includes('default') || configKeys.includes(environment)) {
      finalConfig = deepMergeConfig({ ...baseConfig.default }, baseConfig[environment])
    }
  }

  // Map final options and replace values with env variables
  mapObject(finalConfig, null, (value: any): string => {
    let finalValue = value

    if (typeof value === 'string') {
      finalValue = replaceEnv(finalValue)
      if (cleanOrphanReplaceable) finalValue = cOR(finalValue)
    }

    return finalValue
  })

  return finalConfig
}
