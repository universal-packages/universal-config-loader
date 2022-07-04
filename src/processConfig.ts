import { mapObject } from "@universal-packages/object-mapper"
import { replaceEnv } from "@universal-packages/variable-replacer"

/** Process loaded configuration replaces env variables and selects configurations by environment */
export function processConfig(baseConfig: any, environment?: string): any {
  const configKeys = Object.keys(baseConfig)
  let finalConfig: any = {}

  // If configured select an environment from the loaded from file config
  if (environment) {
    if (configKeys.includes('default') || configKeys.includes(environment)) {
      finalConfig = { ...baseConfig.default, ...baseConfig[environment] }
    }
  } else {
    finalConfig = baseConfig
  }

  // Map final options and replace values with env variables
  mapObject(finalConfig, null, (value: any): string => {
    if (typeof value === 'string') return replaceEnv(value)
  })

  return finalConfig
}
