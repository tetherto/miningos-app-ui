import { renderHook } from '@testing-library/react'
import { describe, expect, it, Mock, vi } from 'vitest'

import { useOperationsDashboardData } from '../useOperationsDashboardData'

import {
  useGetGlobalConfigQuery,
  useGetTailLogQuery,
  useGetTailLogRangeAggrQuery,
} from '@/app/services/api'

vi.mock('@/app/services/api', () => ({
  useGetGlobalConfigQuery: vi.fn(),
  useGetTailLogRangeAggrQuery: vi.fn(),
  useGetTailLogQuery: vi.fn(),
}))

vi.mock('@/Views/ReportingTool/OperationsDashboard/utils', () => ({
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
const mockHashrateData = [
  [
    {
      type: 'miner',
      data: [
        { ts: 1, val: { hashrate_mhs_5m_sum_aggr: 123 } },
        { ts: 2, val: { hashrate_mhs_5m_sum_aggr: 456 } },
      ],
    },
  ],
]
const mockEfficiencyData = [
  [
    {
      type: 'miner',
      data: [
        { ts: 1, val: { efficiency_w_ths_avg_aggr: 11 } },
        { ts: 2, val: { efficiency_w_ths_avg_aggr: 22 } },
      ],
    },
  ],
]
const mockConsumptionData = [
  [
    {
      type: 'powermeter',
      data: [
        { ts: 1, val: { site_power_w: 1000 } },
        { ts: 2, val: { site_power_w: 2000 } },
      ],
    },
  ],
]
const mockMinersData = [
  {
    ts: 1,
    online_or_minor_error_miners_amount_aggr: 10,
    not_mining_miners_amount_aggr: 5,
    offline_cnt: { a: 1, b: 1 },
    maintenance_type_cnt: { a: 4 },
  },
]

const mockedUseGetTailLogRangeAggrQuery = vi.mocked(useGetTailLogRangeAggrQuery) as unknown as Mock
const mockedUseGetGlobalConfigQuery = vi.mocked(useGetGlobalConfigQuery) as unknown as Mock
const mockedUseGetTailLogQuery = vi.mocked(useGetTailLogQuery) as unknown as Mock

describe('useOperationsDashboardData', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
  it('should correctly map all chart data', () => {
    mockedUseGetGlobalConfigQuery.mockReturnValue({
      data: mockGlobalConfig,
      isLoading: false,
    })

    mockedUseGetTailLogRangeAggrQuery
      .mockReturnValueOnce({
        data: mockHashrateData,
        isLoading: false,
        isFetching: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockEfficiencyData,
        isLoading: false,
        isFetching: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockConsumptionData,
        isLoading: false,
        isFetching: false,
        error: null,
      })

    mockedUseGetTailLogQuery.mockReturnValue({
      data: mockMinersData,
      isLoading: false,
      isFetching: false,
      error: null,
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
        '01-01': {
          style: {
            backgroundColor: ['#03C04A4d', '#03C04A1a'],
            borderColor: '#03C04A',
            borderWidth: {
              top: 2,
            },
            legendColor: '#03C04A',
          },
          value: 10,
        },
        label: 'Online',
        legendColor: '#03C04A',
        stackGroup: 'miners',
      },
      {
        '01-01': {
          style: {
            backgroundColor: ['#EF44444d', '#EF44441a'],
            borderColor: '#EF4444',
            borderWidth: {
              top: 2,
            },
            legendColor: '#EF4444',
          },
          value: 0,
        },
        label: 'Error',
        legendColor: '#EF4444',
        stackGroup: 'miners',
      },
      {
        '01-01': {
          style: {
            backgroundColor: ['#FFFFFF4d', '#FFFFFF1a'],
            borderColor: '#FFFFFF',
            borderWidth: {
              top: 2,
            },
            legendColor: '#FFFFFF',
          },
          value: 2,
        },
        label: 'Offline',
        legendColor: '#FFFFFF',
        stackGroup: 'miners',
      },
      {
        '01-01': {
          style: {
            backgroundColor: ['#3B82F64d', '#3B82F61a'],
            borderColor: '#3B82F6',
            borderWidth: {
              top: 2,
            },
            legendColor: '#3B82F6',
          },
          value: 0,
        },
        label: 'Sleep',
        legendColor: '#3B82F6',
        stackGroup: 'miners',
      },
      {
        '01-01': {
          style: {
            backgroundColor: ['#F59E0B4d', '#F59E0B1a'],
            borderColor: '#F59E0B',
            borderWidth: {
              top: 2,
            },
            legendColor: '#F59E0B',
          },
          value: 4,
        },
        label: 'Maintenance',
        legendColor: '#F59E0B',
        stackGroup: 'miners',
      },
    ])

    expect(data.isAnyLoading).toBe(false)
  })

  it('should return empty arrays when APIs return nothing', () => {
    mockedUseGetGlobalConfigQuery.mockReturnValue({ data: [], isLoading: false })
    mockedUseGetTailLogRangeAggrQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      error: null,
    })
    mockedUseGetTailLogQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      error: null,
    })

    const { result } = renderHook(() => useOperationsDashboardData({ start: 0, end: 0 }))

    expect(result.current.hashrate.data).toEqual([])
    expect(result.current.efficiency.data).toEqual([])
    expect(result.current.consumption.data).toEqual([])
    expect(result.current.miners.data).toBeNull()
    expect(result.current.isAnyLoading).toBe(false)
  })

  it('should return loading=true if any API is loading', () => {
    mockedUseGetGlobalConfigQuery.mockReturnValue({ data: [], isLoading: true })
    mockedUseGetTailLogRangeAggrQuery.mockReturnValue({
      data: [],
      isLoading: true,
      isFetching: false,
      error: null,
    })
    mockedUseGetTailLogQuery.mockReturnValue({
      data: [],
      isLoading: true,
      isFetching: false,
      error: null,
    })

    const { result } = renderHook(() => useOperationsDashboardData(mockDateRange))

    expect(result.current.isAnyLoading).toBe(true)
  })
})
