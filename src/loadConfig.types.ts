export type Format = 'json' | 'yaml' | 'yml' | 'js' | 'ts'
export type FormatPriority = Format[]

export interface LoadConfigOptions {
  formatPriority?: FormatPriority
  maxDepth?: number
  selectEnvironment?: string
}
