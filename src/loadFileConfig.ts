import { LoadFileConfigOptions } from './loadFileConfig.types'
import { prioritizeFormatAndLoad } from './prioritizeFormatAndLoad'
import { processConfig } from './processConfig'

/** Loads the content of a provided file basename without extension and loads based on the priority provided. */
export function loadFileConfig(location: string, options?: LoadFileConfigOptions): any {
  const finalOptions: LoadFileConfigOptions = { formatPriority: ['ts', 'js', 'json', 'yaml', 'yml'], ...options }
  const loadedConfig = prioritizeFormatAndLoad(location, finalOptions.formatPriority)

  if (loadedConfig) {
    const processedConfig = processConfig(
      loadedConfig,
      finalOptions.cleanOrphanReplaceable,
      finalOptions.selectEnvironment === true ? process.env['NODE_ENV'] : finalOptions.selectEnvironment
    )

    return processedConfig
  }
}
