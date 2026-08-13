import { describe, it, expect, vi } from 'vitest'

vi.mock('@/app/services/logger', () => ({
  Logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

import { getMinersPoolName } from '../SiteOverviewDetailsContainer.utils'

describe('getMinersPoolName', () => {
  it('returns empty string when miners array is undefined', () => {
    expect(getMinersPoolName(undefined)).toBe('')
  })

  it('returns empty string when miners array is empty', () => {
    expect(getMinersPoolName([])).toBe('')
  })

  it('returns empty string when no miner has a config snap', () => {
    const miners = [{ id: '1', last: { snap: {} } }] as never
    expect(getMinersPoolName(miners)).toBe('')
  })

  it('returns empty string when pool_config is empty', () => {
    const miners = [{ last: { snap: { config: { pool_config: [] } } } }] as never
    expect(getMinersPoolName(miners)).toBe('')
  })

  it('extracts pool name from valid URL', () => {
    const miners = [
      {
        last: {
          snap: {
            config: {
              pool_config: [{ url: 'stratum+tcp://pool.antpool.com:3333' }],
            },
          },
        },
      },
    ] as never
    const result = getMinersPoolName(miners)
    expect(result).toBe('antpool')
  })

  it('returns empty string for an invalid URL', () => {
    const miners = [
      {
        last: {
          snap: {
            config: {
              pool_config: [{ url: 'not-a-valid-url' }],
            },
          },
        },
      },
    ] as never
    const result = getMinersPoolName(miners)
    expect(result).toBe('')
  })
})
