import { FormatPriority } from './loadConfig.types'

export interface LoadFileConfigOptions {
  formatPriority?: FormatPriority
  selectEnvironment?: string | true
}
