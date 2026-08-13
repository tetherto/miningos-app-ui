import { describe, it, expect } from 'vitest'

import { baseQuery } from '../api/baseQuery'
import { API_TAG_TYPES, CACHE_CONFIG, QUEUE_CONFIG, API_PATHS } from '../api/constants'

describe('api/constants', () => {
  it('exports API_TAG_TYPES array', () => {
    expect(Array.isArray(API_TAG_TYPES)).toBe(true)
    expect(API_TAG_TYPES).toContain('User')
    expect(API_TAG_TYPES).toContain('Action')
  })

  it('exports CACHE_CONFIG with valid values', () => {
    expect(CACHE_CONFIG.KEEP_UNUSED_DATA_FOR).toBeGreaterThan(0)
    expect(typeof CACHE_CONFIG.REFETCH_ON_FOCUS).toBe('boolean')
    expect(CACHE_CONFIG.REFETCH_ON_RECONNECT).toBe(true)
  })

  it('exports QUEUE_CONFIG with concurrency values', () => {
    expect(QUEUE_CONFIG.HIGH_CONCURRENCY).toBeGreaterThan(0)
    expect(QUEUE_CONFIG.REPORTING_TOOLS_CONCURRENCY).toBeGreaterThan(0)
    expect(QUEUE_CONFIG.HIGH_CONCURRENCY).toBeGreaterThan(QUEUE_CONFIG.REPORTING_TOOLS_CONCURRENCY)
  })

  it('exports API_PATHS with path identifiers', () => {
    expect(API_PATHS.REPORTING_TOOLS).toBe('reporting-tool')
    expect(API_PATHS.USERINFO).toBe('userinfo')
  })
})

describe('api/baseQuery', () => {
  it('exports baseQuery as a function', () => {
    expect(typeof baseQuery).toBe('function')
  })
})
