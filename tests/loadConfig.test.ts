import path from 'path'
import { loadConfig } from '../src'

describe('loadConfig', (): void => {
  it('loads recursively all data structures in a directory', async (): Promise<void> => {
    const config = await loadConfig('./tests/__fixtures__/good')

    expect(config).toEqual({
      out: {
        priority: {
          extra: 'yes',
          loaded: 'outfile'
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

  it('can be set a max depth', async (): Promise<void> => {
    const config = await loadConfig('./tests/__fixtures__/good', { maxDepth: 0 })

    expect(config).toEqual({
      out: {
        priority: {
          extra: 'yes',
          loaded: 'outfile'
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
      test: {
        pops: 'yes',
        jest: '1',
        squash: 'nop'
      }
    })

    config = await loadConfig('./tests/__fixtures__/environment', { selectEnvironment: 'production' })

    expect(config).toEqual({
      test: {
        pops: 'yes',
        jest: '1',
        squash: 'yep'
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

    expect(error.message).toEqual(`Unexpected token $ in JSON at position 0; in file "${path.resolve('./tests/__fixtures__/bad/json/error.json')}"`)

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
