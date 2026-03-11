import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

const mockFns = vi.hoisted(() => ({
  tailLogRangeAggr: vi.fn(() => ({
    data: undefined as unknown,
    isLoading: false,
    isFetching: false,
    error: null,
  })),
  globalConfig: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  listThings: vi.fn(() => ({ data: undefined as unknown, isLoading: false, refetch: vi.fn() })),
  tailLog: vi.fn(() => ({ data: undefined as unknown, isLoading: false, refetch: vi.fn() })),
}))

vi.mock('@/app/services/api', () => ({
  useGetTailLogRangeAggrQuery: mockFns.tailLogRangeAggr,
  useGetGlobalConfigQuery: mockFns.globalConfig,
  useGetListThingsQuery: mockFns.listThings,
  useGetTailLogQuery: mockFns.tailLog,
}))

import { useEnergyReportData } from '../useEnergyReportData'
import {
  useEnergyReportSiteView,
  getMinersTypePowerModeChartData,
} from '../useEnergyReportSiteView'

const defaultDateRange = { start: Date.now() - 86400000, end: Date.now() }

describe('useEnergyReportData', () => {
  it('returns data, nominalValue, and isLoading when no data', () => {
    const { result } = renderHook(() => useEnergyReportData(defaultDateRange))
    expect(result.current.data).toEqual([])
    expect(result.current.nominalValue).toBe(0)
    expect(result.current.isLoading).toBe(false)
  })

  it('returns null nominalValue when isLoadingNominalValues=true', () => {
    mockFns.globalConfig.mockReturnValueOnce({ data: undefined as unknown, isLoading: true })
    const { result } = renderHook(() => useEnergyReportData(defaultDateRange))
    expect(result.current.nominalValue).toBeNull()
  })

  it('processes array response with powermeter data', () => {
    const powermeterData = {
      type: 'powermeter',
      data: [{ ts: 1000, val: { site_power_w: 5000 } }],
    }
    mockFns.tailLogRangeAggr.mockReturnValueOnce({
      data: [[powermeterData]],
      isLoading: false,
      isFetching: false,
      error: null,
    })
    const { result } = renderHook(() => useEnergyReportData(defaultDateRange))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].consumption).toBe(5000)
  })

  it('handles missing site_power_w in val (falls back to 0)', () => {
    const powermeterData = {
      type: 'powermeter',
      data: [{ ts: 1000, val: {} }],
    }
    mockFns.tailLogRangeAggr.mockReturnValueOnce({
      data: [[powermeterData]],
      isLoading: false,
      isFetching: false,
      error: null,
    })
    const { result } = renderHook(() => useEnergyReportData(defaultDateRange))
    expect(result.current.data[0].consumption).toBe(0)
  })

  it('handles non-array consumptionResponse', () => {
    mockFns.tailLogRangeAggr.mockReturnValueOnce({
      data: { type: 'powermeter', data: [] },
      isLoading: false,
      isFetching: false,
      error: null,
    })
    const { result } = renderHook(() => useEnergyReportData(defaultDateRange))
    // Non-array responseData → empty data
    expect(result.current.data).toEqual([])
  })

  it('returns nominalValue computed from globalConfig', () => {
    mockFns.globalConfig.mockReturnValueOnce({
      data: [{ nominalPowerAvailability_MW: 2 }],
      isLoading: false,
    })
    const { result } = renderHook(() => useEnergyReportData(defaultDateRange))
    // 2 MW * 1000000 = 2000000 W
    expect(result.current.nominalValue).toBe(2000000)
  })

  it('shows isLoading=true when tailLog is fetching', () => {
    mockFns.tailLogRangeAggr.mockReturnValueOnce({
      data: undefined as unknown,
      isLoading: false,
      isFetching: true,
      error: null,
    })
    const { result } = renderHook(() => useEnergyReportData(defaultDateRange))
    expect(result.current.isLoading).toBe(true)
  })
})

describe('getMinersTypePowerModeChartData', () => {
  it('returns empty object when tailLogItem is empty', () => {
    expect(getMinersTypePowerModeChartData('am' as never, {})).toEqual({})
    expect(getMinersTypePowerModeChartData('am' as never, undefined)).toEqual({})
    expect(getMinersTypePowerModeChartData('am' as never, null)).toEqual({})
  })

  it('returns data with totals when tailLogItem has data', () => {
    const tailLogItem = {
      offline_type_cnt: { am: 2, wm: 1 },
      error_type_cnt: { am: 0 },
      power_mode_sleep_type_cnt: { am: 0 },
      power_mode_low_type_cnt: { am: 5 },
      power_mode_normal_type_cnt: { am: 10 },
      power_mode_high_type_cnt: { am: 3 },
      maintenance_type_cnt: { am: 1 },
    }
    const result = getMinersTypePowerModeChartData('am' as never, tailLogItem)
    expect(result).toHaveProperty('total')
    expect((result as { total: number }).total).toBeGreaterThanOrEqual(0)
  })

  it('uses 0 when miner type not found in mode data', () => {
    const tailLogItem = {
      offline_type_cnt: {},
      power_mode_normal_type_cnt: {},
    }
    const result = getMinersTypePowerModeChartData('am' as never, tailLogItem)
    expect(result).toBeDefined()
  })
})

describe('useEnergyReportSiteView', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useEnergyReportSiteView(defaultDateRange))
    expect(result.current).toBeDefined()
    expect(result.current).toHaveProperty('powerConsumptionData')
    expect(result.current).toHaveProperty('powerModeData')
    expect(result.current).toHaveProperty('containers')
    expect(result.current).toHaveProperty('tailLogData')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('refetchSnapshotData')
  })

  it('handles list things data with miners', () => {
    mockFns.listThings.mockReturnValue({
      data: [
        [{ type: 'miner-s19', info: { container: 'container-1' }, last: {}, containerId: 'c1' }],
      ],
      isLoading: false,
      refetch: vi.fn(),
    })
    const { result } = renderHook(() => useEnergyReportSiteView(defaultDateRange))
    expect(result.current.containers.length).toBeGreaterThan(0)
    mockFns.listThings
      .mockReset()
      .mockReturnValue({ data: undefined as unknown, isLoading: false, refetch: vi.fn() })
  })

  it('provides tailLogData as empty array when undefined', () => {
    mockFns.tailLog.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      refetch: vi.fn(),
    })
    const { result } = renderHook(() => useEnergyReportSiteView(defaultDateRange))
    expect(result.current.tailLogData).toEqual([])
  })

  it('processes tailLog data when present', () => {
    const tailLogItem = {
      type_cnt: { am: 5 },
      power_w_type_group_sum_aggr: { am: 1000 },
      hashrate_mhs_5m_active_container_group_cnt: { 'container-1': 3 },
    }
    mockFns.tailLog.mockReturnValue({
      data: [[tailLogItem]],
      isLoading: false,
      refetch: vi.fn(),
    })
    mockFns.listThings.mockReturnValue({
      data: [[{ containerId: 'container-1', info: { container: 'container-1' } }]],
      isLoading: false,
      refetch: vi.fn(),
    })
    const { result } = renderHook(() => useEnergyReportSiteView(defaultDateRange))
    expect(result.current.powerModeData).toBeDefined()
    expect(result.current.containers[0].minersCount).toBe(3)
    mockFns.tailLog
      .mockReset()
      .mockReturnValue({ data: undefined as unknown, isLoading: false, refetch: vi.fn() })
    mockFns.listThings
      .mockReset()
      .mockReturnValue({ data: undefined as unknown, isLoading: false, refetch: vi.fn() })
  })

  it('refetchSnapshotData calls both refetch functions', () => {
    const refetchTailLog = vi.fn()
    const refetchContainers = vi.fn()
    mockFns.tailLog.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      refetch: refetchTailLog,
    })
    mockFns.listThings.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      refetch: refetchContainers,
    })
    const { result } = renderHook(() => useEnergyReportSiteView(defaultDateRange))
    act(() => result.current.refetchSnapshotData())
    expect(refetchTailLog).toHaveBeenCalled()
    expect(refetchContainers).toHaveBeenCalled()
    mockFns.tailLog
      .mockReset()
      .mockReturnValue({ data: undefined as unknown, isLoading: false, refetch: vi.fn() })
    mockFns.listThings
      .mockReset()
      .mockReturnValue({ data: undefined as unknown, isLoading: false, refetch: vi.fn() })
  })

  it('shows isLoading true when miner tail log is loading', () => {
    mockFns.tailLog.mockReturnValue({
      data: undefined as unknown,
      isLoading: true,
      refetch: vi.fn(),
    })
    const { result } = renderHook(() => useEnergyReportSiteView(defaultDateRange))
    expect(result.current.isLoading).toBe(true)
    mockFns.tailLog
      .mockReset()
      .mockReturnValue({ data: undefined as unknown, isLoading: false, refetch: vi.fn() })
  })
})
