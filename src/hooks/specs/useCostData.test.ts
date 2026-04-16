import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { getMetrics, useCostData } from '@/hooks/useCostData'

const mockDateRange = { start: 1000000, end: 2000000, period: 'daily' }

vi.mock('@/app/services/api', () => ({
  useGetBtcDataHashPriceQuery: vi.fn(() => ({ isLoading: false, isFetching: false, data: [] })),
  useGetCostOperationalEnergyQuery: vi.fn(() => ({
    isLoading: false,
    isFetching: false,
    data: undefined,
  })),
}))

vi.mock('@/hooks/useEnergyCostData', () => ({
  useEnergyCostData: vi.fn(() => ({
    costData: {},
    revenueData: [],
    isRevenueDataLoading: false,
    isLoading: false,
  })),
}))

vi.mock('@/hooks/useMultiSiteDateRange', () => ({
  useMultiSiteDateRange: vi.fn(() => ({
    dateRange: mockDateRange,
    onTableDateRangeChange: vi.fn(),
  })),
}))

vi.mock('@/hooks/useMultiSiteRTRequestParams', () => ({
  default: vi.fn(() => ({
    buildRequestParams: vi.fn(() => ({})),
    isLoading: false,
  })),
}))

const mockUseMultiSiteMode = vi.fn()

vi.mock('@/hooks/useMultiSiteMode', () => ({
  useMultiSiteMode: () => mockUseMultiSiteMode(),
}))

describe('useCostData', () => {
  describe('getMetrics', () => {
    it('should return metrics with correct values', () => {
      const metrics = getMetrics({
        allInCost: 100,
        energyCost: 50,
        operationsCost: 30,
      })

      expect(metrics).toEqual({
        totalBtc: {
          label: 'All-in Cost',
          unit: '$/MWh',
          value: 100,
          isHighlighted: true,
        },
        energyCostBtc: {
          label: 'Energy Cost',
          unit: '$/MWh',
          value: 50,
        },
        operationsCostBtc: {
          label: 'Operations Cost',
          unit: '$/MWh',
          value: 30,
        },
      })
    })

    it('should handle zero values correctly', () => {
      const metrics = getMetrics({
        allInCost: 0,
        energyCost: 0,
        operationsCost: 0,
      })

      expect(metrics).toEqual({
        totalBtc: {
          label: 'All-in Cost',
          unit: '$/MWh',
          value: 0,
          isHighlighted: true,
        },
        energyCostBtc: {
          label: 'Energy Cost',
          unit: '$/MWh',
          value: 0,
        },
        operationsCostBtc: {
          label: 'Operations Cost',
          unit: '$/MWh',
          value: 0,
        },
      })
    })
  })

  describe('useCostData hook', () => {
    it('returns early with empty data when isMultiSiteModeEnabled=false', () => {
      mockUseMultiSiteMode.mockReturnValue({
        siteId: 'site1',
        site: {},
        selectedSites: [],
        siteList: [],
        isMultiSiteModeEnabled: false,
      })

      const { result } = renderHook(() => useCostData())

      expect(result.current.isDataLoading).toBe(false)
      expect(result.current.data.costData).toEqual({})
    })

    it('returns full data object when isMultiSiteModeEnabled=true', () => {
      mockUseMultiSiteMode.mockReturnValue({
        siteId: 'site1',
        site: {},
        selectedSites: ['site1'],
        siteList: [],
        isMultiSiteModeEnabled: true,
      })

      const { result } = renderHook(() => useCostData())

      expect(result.current).toHaveProperty('data')
      expect(result.current).toHaveProperty('metrics')
      expect(result.current).toHaveProperty('dateRange')
    })
  })
})
