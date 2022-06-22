export type Format = 'json' | 'yaml' | 'js' | 'ts'
export type FormatPriority = Format[]

export interface LoadConfigOptions {
  formatPriority?: FormatPriority
  selectEnvironment?: string
}
