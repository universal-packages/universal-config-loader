import fs from 'fs'
import yaml from 'yaml'
import path from 'path'
import { traverse, DirectoryMap } from '@universal-packages/directory-traversal'
import { checkFile } from '@universal-packages/fs-utils'
import { FormatPriority, LoadConfigOptions } from './loadConfig.types'
import { mapObject } from '@universal-packages/object-mapper'
import { replaceEnv } from '@universal-packages/variable-replacer'

export const EXTENSIONS = ['.json', '.yaml', '.js', '.ts']

const PARSERS_MAP = {
  json: parseJson,
  js: loadJs,
  ts: loadJs,
  yaml: parseYaml
}

/**
 * Traberse the provided configuration in disk and loads the content of all files
 * with the format `ts`, `js`, `json` or `yaml` and with the priority provided.
 */
export async function loadConfig(location: string, options?: LoadConfigOptions): Promise<any> {
  const finalOptions: LoadConfigOptions = { formatPriority: ['ts', 'js', 'json', 'yaml'], ...options }
  const directoryMap = await traverse(location, { fileFilter: EXTENSIONS })
  const loadedConfig: any = {}

  await recursivelyLoad(directoryMap, finalOptions, loadedConfig)

  return loadedConfig
}

/** Reads the contents of the file and try to parse them from JSON */
async function parseJson(location: string): Promise<any> {
  try {
    return JSON.parse(fs.readFileSync(location).toString())
  } catch (error) {
    error.message = `${error.message}; in file "${location}"`

    throw error
  }
}

/** Reads the contents of the file and try to parse them from yml */
async function parseYaml(location: string): Promise<any> {
  try {
    return yaml.parse(fs.readFileSync(location).toString())
  } catch (error) {
    error.message = `${error.message}; in file "${location}"`

    throw error
  }
}

/** Imports the file as a node module */
async function loadJs(location: string): Promise<any> {
  const module = await import(location)

  return module['default']
}

async function prioritizeFormatAndLoad(base: string, formatPriority: FormatPriority): Promise<any> {
  for (let i = 0; i < formatPriority.length; i++) {
    let finalLocation: string

    try {
      finalLocation = checkFile(`${base}.${formatPriority[i]}`)
    } catch {
      continue
    }

    return await PARSERS_MAP[formatPriority[i]](finalLocation)
  }
}

/**
 * Go through all files and directories in a DirectoryMap object,
 * loads the content of the files, and merge them in the config object
 */
async function recursivelyLoad(directoryMap: DirectoryMap, options: LoadConfigOptions, rootConfig: any): Promise<any> {
  const namesUsed: string[] = []

  // First we go throgh all files in the directory befor going deeper
  for (let i = 0; i < directoryMap.files.length; i++) {
    // Get just the file name: "/home/example/config.json" --> "config"
    const baseFileName = path.basename(directoryMap.files[i]).replace(/\.[^/.]+$/, '')

    // Here starts the prioretization if in this directory this name has alredy been prioritized by prioritizeFormatAndLoad
    // we are just interested in the baseFileName, prioritizeFormatAndLoad will try to load baseFileName.ts, baseFileName.json.. etc
    // but using the priority array, like if the priority says ts is the first to prioritize the we first load baseFileName.ts and
    // if it loads the we stop for other formats
    if (!namesUsed.includes(baseFileName)) {
      // "/home/example/config.json" --> "home/example"
      const directoryLocation = path.dirname(directoryMap.files[i])
      // "home/example/config"
      const baseLocation = path.resolve(directoryLocation, baseFileName)
      const loadedFromFile = await prioritizeFormatAndLoad(baseLocation, options.formatPriority)
      const finalConfig = processConfig(loadedFromFile, options)

      rootConfig[baseFileName] = finalConfig

      namesUsed.push(baseFileName)
    }
  }

  // Now we go ahead and load all directories that will be set in the config object as a new
  // section, if a directory name is 'database', then in the config object a 'database' key will
  // be set and populated with all the configuration files contents in that directory
  for (let i = 0; i < directoryMap.directories.length; i++) {
    const name = path.basename(directoryMap.directories[i].path)

    // If we already loaded a cofig file with the same name as the directory
    // we resque that configuration as __root instead of just overide it with
    // a new directory section
    if (rootConfig[name]) {
      const preConfig = rootConfig[name]
      rootConfig[name] = {}

      rootConfig[name].__root = preConfig
    } else {
      rootConfig[name] = {}
    }

    await recursivelyLoad(directoryMap.directories[i], options, rootConfig[name])
  }
}

/** Process loaded configuration replaces env variables and selects configurations by environment */
function processConfig(baseConfig: any, options: LoadConfigOptions): any {
  const configKeys = Object.keys(baseConfig)
  let finalConfig: any = {}

  // If configured select an environment from the loaded from file config
  if (options.selectEnvironment) {
    if (configKeys.includes('default') || configKeys.includes(options.selectEnvironment)) {
      finalConfig = { ...baseConfig.default, ...baseConfig[options.selectEnvironment] }
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
