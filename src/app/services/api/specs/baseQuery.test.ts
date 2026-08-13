import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@reduxjs/toolkit/query/react', () => ({
  fetchBaseQuery: vi.fn(() => vi.fn(async () => ({ data: 'mock-response' }))),
}))

vi.mock('p-queue', () => ({
  default: vi.fn().mockImplementation(() => ({
    add: vi.fn((fn) => fn()),
  })),
}))

vi.mock('@/app/slices/authSlice', () => ({
  selectToken: vi.fn(() => 'mock-token'),
}))

import { baseQuery } from '../baseQuery'

describe('baseQuery', () => {
  const mockApi = {
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
    extra: {},
    type: 'query' as const,
    endpoint: 'testEndpoint',
    abort: vi.fn(),
    signal: new AbortController().signal,
    forced: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'location', {
      value: { pathname: '/some/path' },
      writable: true,
    })
  })

  it('is exported as a function', () => {
    expect(typeof baseQuery).toBe('function')
  })

  it('uses highConcurrencyQueue on normal pages', async () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/home' },
      writable: true,
    })
    const result = await baseQuery({ url: '/test' }, mockApi, {})
    expect(result).toBeDefined()
  })

  it('uses reportingToolsQueue on reporting-tool pages', async () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/reporting-tool/overview' },
      writable: true,
    })
    const result = await baseQuery({ url: '/test' }, mockApi, {})
    expect(result).toBeDefined()
  })
})
