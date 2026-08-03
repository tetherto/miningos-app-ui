import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'

import { useOperationsDashboardData } from '../useOperationsDashboardData'

import {
  useGetGlobalConfigQuery,
  useGetMetricsConsumptionQuery,
  useGetMetricsEfficiencyQuery,
  useGetMetricsHashrateQuery,
  useGetTailLogQuery,
} from '@/app/services/api'

vi.mock('@/app/services/api', () => ({
  useGetGlobalConfigQuery: vi.fn(),
  useGetMetricsHashrateQuery: vi.fn(),
  useGetMetricsConsumptionQuery: vi.fn(),
  useGetMetricsEfficiencyQuery: vi.fn(),
  useGetTailLogQuery: vi.fn(),
}))

vi.mock('@/Views/Reports/OperationsDashboard/utils', () => ({
  sumObjectValues: (obj: Record<string, number>) =>
    Object.values(obj || {}).reduce((a, b) => a + b, 0),

  transformMinersStatusData: vi.fn((data) => ({
    dataset: data, // return same structure for predictability
  })),
}))

const mockDateRange = { start: 1000, end: 2000 }
const mockGlobalConfig = [
  {
    nominalSiteHashrate_MHS: 100,
    nominalPowerAvailability_MW: 5,
    nominalSiteWeightedAvgEfficiency: 70,
  },
]
const mockHashrateResponse = {
  log: [
    { ts: 1, hashrateMhs: 123 },
    { ts: 2, hashrateMhs: 456 },
  ],
  summary: { avgHashrateMhs: 289.5, totalHashrateMhs: 579 },
}
const mockEfficiencyResponse = {
  log: [
    { ts: 1, efficiencyWThs: 11 },
    { ts: 2, efficiencyWThs: 22 },
  ],
  summary: { avgEfficiencyWThs: 16.5 },
}
const mockConsumptionResponse = {
  log: [
    { ts: 1, powerW: 1000, consumptionMWh: 24 },
    { ts: 2, powerW: 2000, consumptionMWh: 48 },
  ],
  summary: { avgPowerW: 1500, totalConsumptionMWh: 72 },
}
const mockMinersData = [
  {
    ts: 1,
    online_or_minor_error_miners_amount_aggr: 10,
    not_mining_miners_amount_aggr: 5,
    offline_cnt: { a: 1, b: 1 },
    maintenance_type_cnt: { a: 4 },
  },
]

const mockedUseGetGlobalConfigQuery = vi.mocked(useGetGlobalConfigQuery) as unknown as Mock
const mockedUseGetMetricsHashrateQuery = vi.mocked(useGetMetricsHashrateQuery) as unknown as Mock
const mockedUseGetMetricsEfficiencyQuery = vi.mocked(
  useGetMetricsEfficiencyQuery,
) as unknown as Mock
const mockedUseGetMetricsConsumptionQuery = vi.mocked(
  useGetMetricsConsumptionQuery,
) as unknown as Mock
const mockedUseGetTailLogQuery = vi.mocked(useGetTailLogQuery) as unknown as Mock

const idleQuery = { data: undefined, isLoading: false, isFetching: false, error: null }

describe('useOperationsDashboardData', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should correctly map all chart data', () => {
    mockedUseGetGlobalConfigQuery.mockReturnValue({
      data: mockGlobalConfig,
      isLoading: false,
    })
    mockedUseGetMetricsHashrateQuery.mockReturnValue({
      ...idleQuery,
      data: mockHashrateResponse,
    })
    mockedUseGetMetricsEfficiencyQuery.mockReturnValue({
      ...idleQuery,
      data: mockEfficiencyResponse,
    })
    mockedUseGetMetricsConsumptionQuery.mockReturnValue({
      ...idleQuery,
      data: mockConsumptionResponse,
    })
    mockedUseGetTailLogQuery.mockReturnValue({
      ...idleQuery,
      data: mockMinersData,
    })

    const { result } = renderHook(() => useOperationsDashboardData(mockDateRange))

    const data = result.current

    expect(data.hashrate.data).toEqual([
      { ts: 1, hashrate: 123 },
      { ts: 2, hashrate: 456 },
    ])
    expect(data.hashrate.nominalValue).toBe(100)
    expect(data.efficiency.data).toEqual([
      { ts: 1, efficiency: 11 },
      { ts: 2, efficiency: 22 },
    ])
    expect(data.efficiency.nominalValue).toBe(70)
    expect(data.consumption.data).toEqual([
      { ts: 1, consumption: 1000 },
      { ts: 2, consumption: 2000 },
    ])
    expect(data.consumption.nominalValue).toBe(5_000_000) // MW → Watts
    expect(data.miners.data?.dataset).toEqual([
      {
        ts: 1,
        online: 10,
        error: 0,
        notMining: 5,
        offline: 2,
        sleep: 0,
        maintenance: 4,
      },
    ])

    expect(data.isAnyLoading).toBe(false)
  })

  it('should return empty arrays when APIs return nothing', () => {
    mockedUseGetGlobalConfigQuery.mockReturnValue({ data: [], isLoading: false })
    mockedUseGetMetricsHashrateQuery.mockReturnValue(idleQuery)
    mockedUseGetMetricsEfficiencyQuery.mockReturnValue(idleQuery)
    mockedUseGetMetricsConsumptionQuery.mockReturnValue(idleQuery)
    mockedUseGetTailLogQuery.mockReturnValue({ ...idleQuery, data: [] })

    const { result } = renderHook(() => useOperationsDashboardData({ start: 0, end: 0 }))

    expect(result.current.hashrate.data).toEqual([])
    expect(result.current.efficiency.data).toEqual([])
    expect(result.current.consumption.data).toEqual([])
    expect(result.current.miners.data).toBeNull()
    expect(result.current.isAnyLoading).toBe(false)
  })

  it('should return loading=true if any API is loading', () => {
    mockedUseGetGlobalConfigQuery.mockReturnValue({ data: [], isLoading: true })
    mockedUseGetMetricsHashrateQuery.mockReturnValue({ ...idleQuery, isLoading: true })
    mockedUseGetMetricsEfficiencyQuery.mockReturnValue({ ...idleQuery, isLoading: true })
    mockedUseGetMetricsConsumptionQuery.mockReturnValue({ ...idleQuery, isLoading: true })
    mockedUseGetTailLogQuery.mockReturnValue({ ...idleQuery, isLoading: true })

    const { result } = renderHook(() => useOperationsDashboardData(mockDateRange))

    expect(result.current.isAnyLoading).toBe(true)
  })
})
