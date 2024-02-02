import { DirectoryMap, traverse } from '@universal-packages/directory-traversal'
import path from 'path'

import { LoadConfigOptions } from './loadConfig.types'
import { prioritizeFormatAndLoad } from './prioritizeFormatAndLoad'
import { processConfig } from './processConfig'

export const EXTENSIONS = ['json', 'yaml', 'yml', 'js', 'ts']

/**
 * Traverse the provided configuration in disk and loads the content of all files
 * with the format `ts`, `js`, `json` or `yaml` and with the priority provided.
 */
export function loadConfig(location: string, options?: LoadConfigOptions): any {
  const finalOptions: LoadConfigOptions = { formatPriority: ['ts', 'js', 'json', 'yaml', 'yml'], ...options }
  const fileFilter = finalOptions.conventionPrefix ? new RegExp(`\.${finalOptions.conventionPrefix}\.(${EXTENSIONS.join('|')})$`, 'gm') : EXTENSIONS

  const directoryMap = traverse(location, { callback: finalOptions.callback, fileFilter, maxDepth: finalOptions.maxDepth })
  const loadedConfig: any = {}

  recursivelyLoad(directoryMap, finalOptions, loadedConfig)

  return loadedConfig
}

/**
 * Go through all files and directories in a DirectoryMap object,
 * loads the content of the files, and merge them in the config object
 */
function recursivelyLoad(directoryMap: DirectoryMap, options: LoadConfigOptions, rootConfig: any): any {
  const namesUsed: string[] = []

  // First we go through all files in the directory before going deeper
  for (let i = 0; i < directoryMap.files.length; i++) {
    // Get just the file name: "/home/example/config.json" --> "config"
    const baseFileName = path.basename(directoryMap.files[i]).replace(/\.[^/.]+$/, '')

    // Here starts the prioritization if in this directory this name has already been prioritized by prioritizeFormatAndLoad
    // we are just interested in the baseFileName, prioritizeFormatAndLoad will try to load baseFileName.ts, baseFileName.json.. etc
    // but using the priority array, like if the priority says ts is the first to prioritize the we first load baseFileName.ts and
    // if it loads the we stop for other formats
    if (!namesUsed.includes(baseFileName)) {
      // "/home/example/config.json" --> "home/example"
      const directoryLocation = path.dirname(directoryMap.files[i])
      // "home/example/config"
      const baseLocation = path.resolve(directoryLocation, baseFileName)
      const loadedFromFile = prioritizeFormatAndLoad(baseLocation, options.formatPriority)
      const finalConfig = processConfig(
        { ...loadedFromFile },
        options.cleanOrphanReplaceable,
        options.selectEnvironment === true ? process.env['NODE_ENV'] : options.selectEnvironment
      )

      rootConfig[baseFileName] = finalConfig

      namesUsed.push(baseFileName)
    }
  }

  // Now we go ahead and load all directories that will be set in the config object as a new
  // section, if a directory name is 'database', then in the config object a 'database' key will
  // be set and populated with all the configuration files contents in that directory
  for (let i = 0; i < directoryMap.directories.length; i++) {
    const name = path.basename(directoryMap.directories[i].path)

    // If we already loaded a config file with the same name as the directory
    // we rescue that configuration as __root instead of just override it with
    // a new directory section
    if (rootConfig[name]) {
      const preConfig = rootConfig[name]
      rootConfig[name] = {}

      rootConfig[name].__root = preConfig
    } else {
      rootConfig[name] = {}
    }

    recursivelyLoad(directoryMap.directories[i], options, rootConfig[name])
  }
}
