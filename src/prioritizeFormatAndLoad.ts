import { checkFile } from '@universal-packages/fs-utils'
import fs from 'fs'
import yaml from 'yaml'

import { FormatPriority } from './loadConfig.types'

const PARSERS_MAP = {
  json: parseJson,
  js: loadJs,
  ts: loadJs,
  yaml: parseYaml,
  yml: parseYaml
}

/** Based on a base file name it loads the format with the grater priority if exists */
export function prioritizeFormatAndLoad(baseLocation: string, formatPriority: FormatPriority): Record<string, any> {
  for (let i = 0; i < formatPriority.length; i++) {
    let finalLocation: string

    try {
      finalLocation = checkFile(`${baseLocation}.${formatPriority[i]}`)
    } catch {
      // If the check fails the file with the current file extension does not exists or can't be accesed
      continue
    }

    return PARSERS_MAP[formatPriority[i]](finalLocation)
  }
}

/** Reads the contents of the file and try to parse them from JSON */
function parseJson(location: string): any {
  try {
    return JSON.parse(fs.readFileSync(location).toString())
  } catch (error) {
    error.message = `${error.message}; in file "${location}"`

    throw error
  }
}

/** Reads the contents of the file and try to parse them from yml */
function parseYaml(location: string): any {
  try {
    return yaml.parse(fs.readFileSync(location).toString())
  } catch (error) {
    error.message = `${error.message}; in file "${location}"`

    throw error
  }
}

/** Imports the file as a node module */
function loadJs(location: string): any {
  const module = require(location)

  return module.default || module
}
