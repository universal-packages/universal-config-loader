export function deepMergeConfig(target: Record<string, any>, ...sources: Record<string, any>[]): any {
  if (!sources.length) return target

  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (let key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMergeConfig(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  return deepMergeConfig(target, ...sources)
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}
