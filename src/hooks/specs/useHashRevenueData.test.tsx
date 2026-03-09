import { renderHook } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { useHashRevenueData } from '../useHashRevenueData'

vi.mock('@/app/services/api', () => ({
  useGetRevenueQuery: () => ({ isLoading: false, data: { summary: { avg: { hashRevenueUSD_PHS_d: 1 } } } }),
  useGetBtcDataHashrateQuery: () => ({ isLoading: false, data: { log: [] } }),
  useGetBtcDataHashPriceQuery: () => ({ isLoading: false, data: { summary: { avg: { hashprice: 2 } } } }),
}))
vi.mock('../useMultiSiteRTRequestParams', () => ({
  __esModule: true,
  default: () => ({
    buildRequestParams: (p: unknown) => p,
    isLoading: false,
  }),
}))

const createWrapper = (siteId = 'site-1') => {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[`/sites/${siteId}`]}>
      <Routes>
        <Route path="/sites/:siteId" element={children} />
      </Routes>
    </MemoryRouter>
  )
}

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
    const { result } = renderHook(
      () => useHashRevenueData({ dateRange: {}, currency: 'USD' }),
      { wrapper: createWrapper() },
    )
    expect(result.current.isLoading).toBe(false)
  })
})
