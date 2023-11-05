import path from 'path'

import { loadFileConfig } from '../src'

describe(loadFileConfig, (): void => {
  it('loads a single prioritized file', async (): Promise<void> => {
    const config = await loadFileConfig('./tests/__fixtures__/good/out')

    expect(config).toEqual({
      priority: {
        extra: 'yes',
        loaded: 'outfile',
        nodeEnv: 'test',
        evaluation: String(4000 + Number(process.env.JEST_WORKER_ID))
      }
    })
  })

  it(' selects an environment', async (): Promise<void> => {
    let config = await loadFileConfig('./tests/__fixtures__/environment/environment', { selectEnvironment: 'development' })

    expect(config).toEqual({
      pops: 'yes',
      env: 'test',
      other: '{{ OTHER }}',
      deep: { value: 1, test: 3 },
      squash: 'nop'
    })

    config = await loadFileConfig('./tests/__fixtures__/environment/environment', { selectEnvironment: 'production' })

    expect(config).toEqual({ pops: 'yes', env: 'test', other: '{{ OTHER }}', deep: { value: 1 }, squash: 'yep' })

    config = await loadFileConfig('./tests/__fixtures__/environment/environment', { selectEnvironment: true })

    expect(config).toEqual({
      pops: 'yes',
      env: 'test',
      other: '{{ OTHER }}',
      deep: { value: 1, test: 2 },
      squash: 'maybe'
    })
  })

  it('loads config and cleans orphaned replaceable', async (): Promise<void> => {
    const config = await loadFileConfig('./tests/__fixtures__/environment/environment', { cleanOrphanReplaceable: true, selectEnvironment: 'development' })

    expect(config).toEqual({
      pops: 'yes',
      env: 'test',
      other: '',
      deep: { value: 1, test: 3 },
      squash: 'nop'
    })
  })

  it('throws errors from files', async (): Promise<void> => {
    let error: Error

    try {
      await loadFileConfig('./tests/__fixtures__/bad/ts/error')
    } catch (err) {
      error = err
    }

    expect(error.message).toEqual('error is not a function')

    try {
      await loadFileConfig('./tests/__fixtures__/bad/js/error')
    } catch (err) {
      error = err
    }

    expect(error.message).toEqual('error is not a function')

    try {
      await loadFileConfig('./tests/__fixtures__/bad/json/error')
    } catch (err) {
      error = err
    }

    expect(error.message).toMatch(/Unexpected token .*\$.*; in file \".*\/tests\/__fixtures__\/bad\/json\/error.json"/)

    try {
      await loadFileConfig('./tests/__fixtures__/bad/yaml/error')
    } catch (err) {
      error = err
    }

    expect(error.message).toEqual(`Implicit map keys need to be followed by map values at line 1, column 10:

error: - yes
         ^^^
; in file "${path.resolve('./tests/__fixtures__/bad/yaml/error.yaml')}"`)
  })
})
