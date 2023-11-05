import path from 'path'

import { loadConfig } from '../src'

describe(loadConfig, (): void => {
  it('loads recursively all data structures in a directory', async (): Promise<void> => {
    const config = await loadConfig('./tests/__fixtures__/good')

    expect(config).toEqual({
      'convention-prefix': {
        deep: {
          'match.prefix': {
            match: true
          },
          other: {
            other: true
          }
        },
        'match1.prefix': {
          match: true
        },
        'match2.prefix': {
          match: true
        },
        other: {
          other: true
        }
      },
      out: {
        priority: {
          extra: 'yes',
          loaded: 'outfile',
          nodeEnv: 'test',
          evaluation: String(4000 + Number(process.env.JEST_WORKER_ID))
        }
      },
      merged: {
        conf: {
          __root: { conf: { value: 'root' } },
          merged: { conf: { value: 'merged deep' } }
        }
      },
      multiple: { A: { multiple: { value: 'A' } }, B: { multiple: { value: 'B' } }, C: { multiple: { value: 'C' } } },
      priorityA: { priority: { priority: { loaded: 'ts', extra: 'nop' } } },
      priorityB: { priority: { priority: { loaded: 'js', extra: 'nop' } } },
      priorityC: { priority: { priority: { loaded: 'json', extra: 'nop' } } },
      priorityD: { priority: { priority: { loaded: 'yaml', extra: 'nop' } } }
    })
  })

  it('loads recursively all data structures in a directory with a prefix', async (): Promise<void> => {
    const config = await loadConfig('./tests/__fixtures__/good', { conventionPrefix: 'prefix' })

    expect(config).toEqual({
      'convention-prefix': {
        deep: {
          'match.prefix': {
            match: true
          }
        },
        'match1.prefix': {
          match: true
        },
        'match2.prefix': {
          match: true
        }
      },
      merged: { conf: {} },
      multiple: {},
      priorityA: {},
      priorityB: {},
      priorityC: {},
      priorityD: {}
    })
  })

  it('can be set a max depth', async (): Promise<void> => {
    const config = await loadConfig('./tests/__fixtures__/good', { maxDepth: 0 })

    expect(config).toEqual({
      'convention-prefix': {},
      out: {
        priority: {
          extra: 'yes',
          loaded: 'outfile',
          nodeEnv: 'test',
          evaluation: String(4000 + Number(process.env.JEST_WORKER_ID))
        }
      },
      merged: {},
      multiple: {},
      priorityA: {},
      priorityB: {},
      priorityC: {},
      priorityD: {}
    })
  })

  it('loads config and selects an environment', async (): Promise<void> => {
    let config = await loadConfig('./tests/__fixtures__/environment', { selectEnvironment: 'development' })

    expect(config).toEqual({
      environment: {
        pops: 'yes',
        env: 'test',
        other: '{{ OTHER }}',
        deep: { value: 1, test: 3 },
        squash: 'nop'
      }
    })

    config = await loadConfig('./tests/__fixtures__/environment', { selectEnvironment: 'production' })

    expect(config).toEqual({
      environment: { pops: 'yes', env: 'test', other: '{{ OTHER }}', deep: { value: 1 }, squash: 'yep' }
    })

    config = await loadConfig('./tests/__fixtures__/environment', { selectEnvironment: true })

    expect(config).toEqual({
      environment: {
        pops: 'yes',
        env: 'test',
        other: '{{ OTHER }}',
        deep: { value: 1, test: 2 },
        squash: 'maybe'
      }
    })
  })

  it('loads config and cleans orphaned replaceable', async (): Promise<void> => {
    let config = await loadConfig('./tests/__fixtures__/environment', { cleanOrphanReplaceable: true, selectEnvironment: 'development' })

    expect(config).toEqual({
      environment: {
        pops: 'yes',
        env: 'test',
        other: '',
        deep: { value: 1, test: 3 },
        squash: 'nop'
      }
    })
  })

  it('throws errors from files', async (): Promise<void> => {
    let error: Error

    try {
      await loadConfig('./tests/__fixtures__/bad/ts')
    } catch (err) {
      error = err
    }

    expect(error.message).toEqual('error is not a function')

    try {
      await loadConfig('./tests/__fixtures__/bad/js')
    } catch (err) {
      error = err
    }

    expect(error.message).toEqual('error is not a function')

    try {
      await loadConfig('./tests/__fixtures__/bad/json')
    } catch (err) {
      error = err
    }

    expect(error.message).toMatch(/Unexpected token .*\$.*; in file \".*\/tests\/__fixtures__\/bad\/json\/error.json"/)

    try {
      await loadConfig('./tests/__fixtures__/bad/yaml')
    } catch (err) {
      error = err
    }

    expect(error.message).toEqual(`Implicit map keys need to be followed by map values at line 1, column 10:

error: - yes
         ^^^
; in file "${path.resolve('./tests/__fixtures__/bad/yaml/error.yaml')}"`)
  })
})
