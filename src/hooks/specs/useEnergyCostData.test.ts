import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import { getMetrics, useEnergyCostData } from '../useEnergyCostData'
import useMultiSiteRTRequestParams from '../useMultiSiteRTRequestParams'

import {
  useGetCostOperationalEnergyQuery,
  useGetOperationsConsumptionQuery,
  useGetRevenueQuery,
} from '@/app/services/api'
import { useMultiSiteMode } from '@/hooks/useMultiSiteMode'

const mockUseMultiSiteRTRequestParams = vi.hoisted(() => vi.fn())
// ---- mock dependencies ----
vi.mock('@/hooks/useMultiSiteMode', () => ({
  useMultiSiteMode: vi.fn(),
}))

vi.mock('../useMultiSiteRTRequestParams', () => ({
  __esModule: true,
  default: mockUseMultiSiteRTRequestParams,
}))

vi.mock('@/app/services/api', () => ({
  useGetCostOperationalEnergyQuery: vi.fn(),
  useGetOperationsConsumptionQuery: vi.fn(),
  useGetRevenueQuery: vi.fn(),
}))

describe('getMetrics', () => {
  it('should returns metrics with default values', () => {
    const result = getMetrics({
      avgPowerConsumption: 0,
      avgAllInCost: 0,
      avgEnergyCost: 0,
      avgPowerAvailability: 0,
      avgEnergyRevenue: 0,
      avgOperationsCost: 0,
    })
    expect(result.avgPowerConsumption.value).toBe(0)
    expect(result.avgEnergyCost.value).toBe(0)
    expect(result.avgEnergyRevenue.value).toBe(0)
  })

  it('maps provided values into metrics with labels and units', () => {
    const result = getMetrics({
      avgPowerConsumption: 10,
      avgAllInCost: 20,
      avgEnergyCost: 30,
      avgPowerAvailability: 40,
      avgEnergyRevenue: 50,
      avgOperationsCost: 60,
    })

    expect(result.avgPowerConsumption).toEqual({
      label: 'Avg Power Consumption',
      unit: 'MW',
      value: 10,
    })
    expect(result.avgEnergyRevenue.value).toBe(50)
  })
})

describe('useEnergyCostData', () => {
  const mockBuildRequestParams = vi.fn().mockReturnValue({ mocked: 'params' })

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useMultiSiteMode).mockReturnValue({
      siteId: 'site-1',
      selectedSites: [],
      site: {},
      siteList: [],
      setSelectedSites: vi.fn(),
      setSelectedSitesManually: vi.fn(),
      siteSelectOptions: [],
      isMultiSiteModeEnabled: true,
      getSiteById: vi.fn(),
      isLoading: false,
    } as ReturnType<typeof useMultiSiteMode>)

    vi.mocked(useMultiSiteRTRequestParams).mockReturnValue({
      buildRequestParams: mockBuildRequestParams,
      isLoading: false,
    })

    vi.mocked(useGetOperationsConsumptionQuery).mockReturnValue({
      data: { data: { log: [{ consumption: { consumption: 100 } }] } },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    })

    vi.mocked(useGetCostOperationalEnergyQuery).mockReturnValue({
      data: {
        summary: {
          key1: { avgAllInCostsUSD: 10, avgEnergyCostsUSD: 20, avgOperationalCostsUSD: 30 },
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    })

    vi.mocked(useGetRevenueQuery).mockReturnValue({
      data: { summary: { avg: { revenueUSD: 500 } }, log: [{ id: 1 }] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    })
  })

  it('should builds request params with siteId when no selectedSites', () => {
    renderHook(() =>
      useEnergyCostData({ dateRange: { period: 'daily', start: 1234567890, end: 1234567900 } }),
    )
    expect(mockBuildRequestParams).toHaveBeenCalledWith(
      expect.objectContaining({ sites: ['site-1'] }),
    )
  })

  it('should returns metrics with calculated values', () => {
    const { result } = renderHook(() =>
      useEnergyCostData({ dateRange: { period: 'daily', start: 1234567890, end: 1234567900 } }),
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.metrics.avgPowerConsumption.value).toBe(100)
    expect(result.current.metrics.avgAllInCost.value).toBe(10)
    expect(result.current.metrics.avgEnergyRevenue.value).toBe(500)
    expect(result.current.revenueData).toEqual([{ id: 1 }])
  })

  it('should returns isLoading true if any query is loading', () => {
    vi.mocked(useGetRevenueQuery).mockReturnValueOnce({
      data: null,
      isLoading: true,
      isFetching: true,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() =>
      useEnergyCostData({ dateRange: { period: 'daily', start: 1234567890, end: 1234567900 } }),
    )

    expect(result.current.isLoading).toBe(true)
  })
})
