import { mapObject } from '@universal-packages/object-mapper'
import { replaceEnv } from '@universal-packages/variable-replacer'

/** Process loaded configuration replaces env variables and selects configurations by environment */
export function processConfig(baseConfig: any, environment?: string): any {
  const configKeys = Object.keys(baseConfig)
  let finalConfig: any = baseConfig

  // If configured select an environment from the loaded from file config
  if (environment) {
    if (configKeys.includes('default') || configKeys.includes(environment)) {
      finalConfig = mergeDeep({ ...baseConfig.default }, baseConfig[environment])
    }
  }

  // Map final options and replace values with env variables
  mapObject(finalConfig, null, (value: any): string => {
    if (typeof value === 'string') return replaceEnv(value)
  })

  return finalConfig
}

function mergeDeep(target: any, ...sources: any[]): any {
  if (!sources.length) return target

  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (let key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  return mergeDeep(target, ...sources)
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}
