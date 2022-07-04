import { loadFileConfig } from '../src'

describe('loadFileConfig', (): void => {
  it('loads a single prioretized file', async (): Promise<void> => {
    const config = await loadFileConfig('./tests/__fixtures__/good/out')

    expect(config).toEqual({
      priority: {
        extra: 'yes',
        loaded: 'outfile',
        nodeEnv: 'test'
      }
    })
  })
})
