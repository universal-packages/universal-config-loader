import { FormatPriority } from './loadConfig.types'

export interface LoadFileConfigOptions {
  cleanOrphanReplaceable?: boolean
  formatPriority?: FormatPriority
  selectEnvironment?: string | true
}
