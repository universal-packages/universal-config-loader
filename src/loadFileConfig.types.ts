import { FormatPriority } from './loadConfig.types'

export interface LoadFileConfigOptions {
  cleanOrphanReplaceable?: boolean
  defaultConfig?: Record<string, any>
  formatPriority?: FormatPriority
  selectEnvironment?: string | true
}
