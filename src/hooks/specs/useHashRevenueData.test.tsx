import { renderHook } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { useHashRevenueData } from '../useHashRevenueData'

const mockFns = vi.hoisted(() => ({
  revenueQuery: vi.fn(() => ({
    isLoading: false,
    data: { summary: { avg: { hashRevenueUSD_PHS_d: 1 } }, log: [{ ts: 1, hash: 1 }] } as unknown,
  })),
  hashrateQuery: vi.fn(() => ({ isLoading: false, data: { log: [{ ts: 1, val: 1 }] } as unknown })),
  hashPriceQuery: vi.fn(() => ({
    isLoading: false,
    data: { summary: { avg: { hashprice: 2 } }, log: [] } as unknown,
  })),
  paramBuilderIsLoading: false,
}))

vi.mock('@/app/services/api', () => ({
  useGetRevenueQuery: mockFns.revenueQuery,
  useGetBtcDataHashrateQuery: mockFns.hashrateQuery,
  useGetBtcDataHashPriceQuery: mockFns.hashPriceQuery,
}))
vi.mock('../useMultiSiteRTRequestParams', () => ({
  __esModule: true,
  default: () => ({
    buildRequestParams: (p: unknown) => p,
    isLoading: mockFns.paramBuilderIsLoading,
  }),
}))

const createWrapper =
  (siteId = 'site-1') =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[`/sites/${siteId}`]}>
      <Routes>
        <Route path="/sites/:siteId" element={children} />
      </Routes>
    </MemoryRouter>
  )

describe('useHashRevenueData', () => {
  it('returns isLoading, metrics and data logs', () => {
    const { result } = renderHook(
      () =>
        useHashRevenueData({
          dateRange: { start: 0, end: 1, period: 'daily' },
          currency: 'USD',
        }),
      { wrapper: createWrapper() },
    )
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('metrics')
    expect(result.current).toHaveProperty('hashrateData')
    expect(result.current).toHaveProperty('btcData')
    expect(result.current).toHaveProperty('hashPriceData')
    expect(result.current.metrics).toHaveProperty('avgHashRevenue')
    expect(result.current.metrics).toHaveProperty('avgNetworkHashprice')
    expect(result.current.metrics.avgHashRevenue.unit).toBe('USD/PH/day')
  })

  it('skips queries when dateRange has no start or end', () => {
    const { result } = renderHook(() => useHashRevenueData({ dateRange: {}, currency: 'USD' }), {
      wrapper: createWrapper(),
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('returns data.log arrays for hashrate and btcData', () => {
    const { result } = renderHook(
      () => useHashRevenueData({ dateRange: { start: 0, end: 1 }, currency: 'USD' }),
      { wrapper: createWrapper() },
    )
    expect(result.current.hashrateData).toEqual([{ ts: 1, val: 1 }])
    expect(result.current.btcData).toEqual([{ ts: 1, hash: 1 }])
  })

  it('returns undefined for log when data has no log property', () => {
    mockFns.hashrateQuery.mockReturnValueOnce({ isLoading: false, data: {} })
    mockFns.revenueQuery.mockReturnValueOnce({ isLoading: false, data: {} })
    const { result } = renderHook(
      () => useHashRevenueData({ dateRange: { start: 0, end: 1 }, currency: 'USD' }),
      { wrapper: createWrapper() },
    )
    expect(result.current.hashrateData).toBeUndefined()
    expect(result.current.btcData).toBeUndefined()
  })

  it('shows isLoading=true when btcData query is loading', () => {
    mockFns.revenueQuery.mockReturnValueOnce({ isLoading: true, data: undefined as unknown })
    const { result } = renderHook(
      () => useHashRevenueData({ dateRange: { start: 0, end: 1 }, currency: 'USD' }),
      { wrapper: createWrapper() },
    )
    expect(result.current.isLoading).toBe(true)
  })

  it('shows isLoading=true when hashrate query is loading', () => {
    mockFns.hashrateQuery.mockReturnValueOnce({ isLoading: true, data: undefined as unknown })
    const { result } = renderHook(
      () => useHashRevenueData({ dateRange: { start: 0, end: 1 }, currency: 'USD' }),
      { wrapper: createWrapper() },
    )
    expect(result.current.isLoading).toBe(true)
  })

  it('handles null dateRange (triggers dateRange ?? {} null-coalescing)', () => {
    const { result } = renderHook(
      () =>
        useHashRevenueData({
          dateRange: null as unknown as Record<string, unknown>,
          currency: 'USD',
        }),
      { wrapper: createWrapper() },
    )
    expect(result.current.isLoading).toBe(false)
    expect(result.current.metrics).toBeDefined()
  })

  it('handles undefined dateRange (triggers dateRange ?? {})', () => {
    const { result } = renderHook(
      () =>
        useHashRevenueData({
          dateRange: undefined as unknown as Record<string, unknown>,
          currency: 'USD',
        }),
      { wrapper: createWrapper() },
    )
    expect(result.current.isLoading).toBe(false)
  })

  it('skips queries and shows loading when isParamBuilderLoading is true', () => {
    // Override paramBuilderIsLoading via the mock module
    const origIsLoading = mockFns.paramBuilderIsLoading
    mockFns.paramBuilderIsLoading = true
    const { result } = renderHook(
      () => useHashRevenueData({ dateRange: { start: 0, end: 1 }, currency: 'USD' }),
      { wrapper: createWrapper() },
    )
    expect(result.current.isLoading).toBe(true)
    mockFns.paramBuilderIsLoading = origIsLoading
  })

  it('shows isLoading=true when only hashPriceData query is loading', () => {
    mockFns.hashPriceQuery.mockReturnValueOnce({ isLoading: true, data: undefined as unknown })
    const { result } = renderHook(
      () => useHashRevenueData({ dateRange: { start: 0, end: 1 }, currency: 'USD' }),
      { wrapper: createWrapper() },
    )
    expect(result.current.isLoading).toBe(true)
  })
})
