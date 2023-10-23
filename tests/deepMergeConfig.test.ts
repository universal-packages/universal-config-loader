import path from 'path'

import { deepMergeConfig, loadConfig } from '../src'

describe(deepMergeConfig, (): void => {
  it('merges two or more configs deeply', (): void => {
    const config = deepMergeConfig({ a: { b: { c: 1 } } }, { a: { b: { d: 2 } } }, { a: { b: { e: 3 } } })

    expect(config).toEqual({ a: { b: { c: 1, d: 2, e: 3 } } })
  })
})
