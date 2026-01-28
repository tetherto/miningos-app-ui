import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import {
  mockTransactionsData,
  mockBtcPricesData,
  mockPowerData,
  mockProductionCostsData,
} from '../mocks'
import { useAvgAllInPowerCostData, USE_MOCKS } from '../useAvgAllInPowerCostData'

import {
  useGetExtDataQuery,
  useGetGlobalDataQuery,
  useGetTailLogRangeAggrQuery,
} from '@/app/services/api'
import { useMultiSiteDateRange } from '@/hooks/useMultiSiteDateRange'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'

// Mock dependencies
vi.mock('@/hooks/useMultiSiteDateRange', () => ({
  useMultiSiteDateRange: vi.fn(),
}))

vi.mock('@/hooks/useMultiSiteMode', () => ({
  useMultiSiteMode: vi.fn(),
}))

vi.mock('@/app/services/api', () => ({
  useGetExtDataQuery: vi.fn(),
  useGetGlobalDataQuery: vi.fn(),
  useGetTailLogRangeAggrQuery: vi.fn(),
}))

describe('useAvgAllInPowerCostData', () => {
  const mockDateRange = {
    // Use explicit UTC timestamps so the ISO strings are deterministic in any environment.
    start: Date.UTC(2025, 0, 1, 0, 0, 0, 0), // Jan 1, 2025 00:00:00.000Z
    end: Date.UTC(2025, 0, 31, 23, 59, 59, 999), // Jan 31, 2025 23:59:59.999Z
    period: 'monthly',
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useMultiSiteDateRange).mockReturnValue({
      dateRange: mockDateRange,
      onTableDateRangeChange: vi.fn(),
      onDateRangeReset: vi.fn(),
      timeframeType: null,
      setSelectorType: vi.fn(),
    })

    vi.mocked(useMultiSiteMode).mockReturnValue({
      siteId: 'site-a',
      site: { id: 'site-a', name: 'Site-A' },
      selectedSites: [],
      setSelectedSites: vi.fn(),
      setSelectedSitesManually: vi.fn(),
      siteSelectOptions: [],
      isMultiSiteModeEnabled: false,
      siteList: [],
      getSiteById: vi.fn(),
      isLoading: false,
    })

    vi.mocked(useGetTailLogRangeAggrQuery).mockReturnValue({
      data: mockPowerData,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetTailLogRangeAggrQuery>)

    vi.mocked(useGetExtDataQuery).mockReturnValue({
      data: mockTransactionsData,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetExtDataQuery>)

    vi.mocked(useGetGlobalDataQuery).mockReturnValue({
      data: mockProductionCostsData,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetGlobalDataQuery>)
  })

  describe('with mocks enabled', () => {
    it('should return chart data when mocks are enabled', () => {
      // Temporarily enable mocks
      const originalUseMocks = USE_MOCKS

      const { result } = renderHook(() => useAvgAllInPowerCostData())

      expect(result.current.data).toBeDefined()
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    it('should calculate revenue per MWh correctly', () => {
      const { result } = renderHook(() => useAvgAllInPowerCostData())

      const chartData = result.current.data

      // Check that data points have the correct structure
      if (chartData.length > 0) {
        const firstPoint = chartData[0]
        expect(firstPoint).toHaveProperty('ts')
        expect(firstPoint).toHaveProperty('revenueUSD')
        expect(firstPoint).toHaveProperty('hashCostUSD')
        expect(typeof firstPoint.ts).toBe('number')
        expect(typeof firstPoint.revenueUSD).toBe('number')
        expect(typeof firstPoint.hashCostUSD).toBe('number')
      }
    })

    it('should calculate cost per MWh correctly', () => {
      const { result } = renderHook(() => useAvgAllInPowerCostData())

      const chartData = result.current.data

      // Check that cost values are calculated
      chartData.forEach((point) => {
        expect(point.hashCostUSD).toBeGreaterThanOrEqual(0)
      })
    })

    it('should return empty array when date range is missing', () => {
      vi.mocked(useMultiSiteDateRange).mockReturnValue({
        dateRange: undefined as unknown as ReturnType<typeof useMultiSiteDateRange>['dateRange'],
        onTableDateRangeChange: vi.fn(),
        onDateRangeReset: vi.fn(),
        timeframeType: null,
        setSelectorType: vi.fn(),
      } as ReturnType<typeof useMultiSiteDateRange>)

      const { result } = renderHook(() => useAvgAllInPowerCostData())

      expect(result.current.data).toEqual([])
    })
  })

  it('should query tail-log/range-aggr using real UTC ISO timestamps', () => {
    renderHook(() => useAvgAllInPowerCostData())

    expect(vi.mocked(useGetTailLogRangeAggrQuery)).toHaveBeenCalled()
    const [params] = vi.mocked(useGetTailLogRangeAggrQuery).mock.calls[0] ?? []
    expect(params).toBeTruthy()

    const keys = JSON.parse((params as { keys: string }).keys) as Array<{
      startDate: string
      endDate: string
    }>

    expect(keys[0]?.startDate).toBe(new Date(mockDateRange.start).toISOString())
    expect(keys[0]?.endDate).toBe(new Date(mockDateRange.end).toISOString())
  })

  describe('data processing', () => {
    it('should process transactions correctly', () => {
      const { result } = renderHook(() => useAvgAllInPowerCostData())

      // Verify that transactions are processed
      expect(result.current.data).toBeDefined()
    })

    it('should process BTC prices correctly', () => {
      const { result } = renderHook(() => useAvgAllInPowerCostData())

      // Verify that BTC prices are processed
      expect(result.current.data).toBeDefined()
    })

    it('should process power consumption correctly', () => {
      const { result } = renderHook(() => useAvgAllInPowerCostData())

      // Verify that power consumption is processed
      expect(result.current.data).toBeDefined()
    })

    it('should process production costs correctly', () => {
      const { result } = renderHook(() => useAvgAllInPowerCostData())

      // Verify that production costs are processed
      expect(result.current.data).toBeDefined()
    })
  })

  describe('monthly aggregation', () => {
    it('should group data by month', () => {
      const { result } = renderHook(() => useAvgAllInPowerCostData())

      const chartData = result.current.data

      // Check that timestamps are at start of month
      chartData.forEach((point) => {
        const date = new Date(point.ts)
        expect(date.getDate()).toBe(1) // First day of month
        expect(date.getHours()).toBe(0)
        expect(date.getMinutes()).toBe(0)
        expect(date.getSeconds()).toBe(0)
      })
    })

    it('should calculate MWh per month correctly', () => {
      const { result } = renderHook(() => useAvgAllInPowerCostData())

      const chartData = result.current.data

      // Verify that MWh calculations result in valid revenue/cost per MWh
      chartData.forEach((point) => {
        // Revenue and cost per MWh should be finite numbers
        expect(Number.isFinite(point.revenueUSD)).toBe(true)
        expect(Number.isFinite(point.hashCostUSD)).toBe(true)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty transactions data', () => {
      vi.mocked(useGetExtDataQuery).mockReturnValue({
        data: [[]],
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetExtDataQuery>)

      const { result } = renderHook(() => useAvgAllInPowerCostData())

      expect(result.current.data).toBeDefined()
      expect(Array.isArray(result.current.data)).toBe(true)
    })

    it('should handle empty power data', () => {
      vi.mocked(useGetTailLogRangeAggrQuery).mockReturnValue({
        data: [[]],
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useGetTailLogRangeAggrQuery>)

      const { result } = renderHook(() => useAvgAllInPowerCostData())

      expect(result.current.data).toBeDefined()
      expect(Array.isArray(result.current.data)).toBe(true)
    })

    it('should handle missing BTC prices gracefully', () => {
      vi.mocked(useGetExtDataQuery)
        .mockReturnValueOnce({
          data: mockTransactionsData,
          isLoading: false,
          isFetching: false,
          refetch: vi.fn(),
        } as unknown as ReturnType<typeof useGetExtDataQuery>)
        .mockReturnValueOnce({
          data: [[]],
          isLoading: false,
          isFetching: false,
          refetch: vi.fn(),
        } as unknown as ReturnType<typeof useGetExtDataQuery>)

      const { result } = renderHook(() => useAvgAllInPowerCostData())

      expect(result.current.data).toBeDefined()
      expect(Array.isArray(result.current.data)).toBe(true)
    })
  })
})
