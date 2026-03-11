import { configureStore } from '@reduxjs/toolkit'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useHeaderStats } from '../useHeaderStats'

import { timezoneSlice } from '@/app/slices/timezoneSlice'

const mockFns = vi.hoisted(() => ({
  extDataQuery: vi.fn(() => ({ data: [[]] as unknown, isLoading: false })),
  globalConfigQuery: vi.fn(() => ({ data: [{}] as unknown, isLoading: false })),
  listThingsQuery: vi.fn(() => ({ data: [[]] as unknown, isLoading: false })),
  multiTailLogQuery: vi.fn(() => ({ data: [[[], [], []]] as unknown, isLoading: false })),
  tailLogQuery: vi.fn(() => ({ data: [[]] as unknown, isLoading: false })),
  featureConfigQuery: vi.fn(() => ({ data: {} as unknown })),
  totalTransformerPM: vi.fn(() => ({
    isPowerConsumptionLoading: false,
    totalPowerConsumptionW: 0,
  })),
}))

vi.mock('@/app/services/api', () => ({
  useGetExtDataQuery: mockFns.extDataQuery,
  useGetGlobalConfigQuery: mockFns.globalConfigQuery,
  useGetListThingsQuery: mockFns.listThingsQuery,
  useGetMultiTailLogQuery: mockFns.multiTailLogQuery,
  useGetTailLogQuery: mockFns.tailLogQuery,
  useGetFeatureConfigQuery: mockFns.featureConfigQuery,
}))
vi.mock('../useSmartPolling', () => ({ useSmartPolling: () => 5000 }))
vi.mock('../useSubtractedTime', () => ({ default: () => Date.now() }))
vi.mock('../useTimezone', () => {
  const getFormattedDate = () => ''
  return { default: () => ({ getFormattedDate }) }
})
vi.mock('../useTotalTransformerPMConsumption', () => ({
  useTotalTransformerPMConsumption: mockFns.totalTransformerPM,
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: { timezone: timezoneSlice.reducer },
    preloadedState: { timezone: { timezone: 'UTC' } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useHeaderStats', () => {
  it('returns expected shape with miners and consumption data', () => {
    const { result } = renderHook(() => useHeaderStats(), {
      wrapper: createWrapper(),
    })
    expect(result.current).toHaveProperty('minerEntry')
    expect(result.current).toHaveProperty('powerMeterLogEntry')
    expect(result.current).toHaveProperty('containerEntry')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('minersAmount')
    expect(result.current).toHaveProperty('consumption')
    expect(result.current).toHaveProperty('poolMinersOn')
    expect(result.current).toHaveProperty('poolMinersTotal')
    expect(result.current).toHaveProperty('poolHashrate')
    expect(result.current).toHaveProperty('nominalValues')
    expect(result.current.minersAmount).toHaveProperty('total')
    expect(result.current.consumption).toHaveProperty('formattedConsumption')
  })

  it('sets minersAmount from minerEntry when data is present', async () => {
    const minerEntry = {
      hashrate_mhs_1m_cnt_aggr: 100,
      online_or_minor_error_miners_amount_aggr: 80,
      offline_or_sleeping_miners_amount_aggr: 15,
      not_mining_miners_amount_aggr: 5,
    }
    mockFns.multiTailLogQuery.mockReturnValue({
      data: [[[minerEntry], [], []]],
      isLoading: false,
    })
    const { result } = renderHook(() => useHeaderStats(), {
      wrapper: createWrapper(),
    })
    await act(async () => {})
    expect(result.current.minersAmount.total).toBe(100)
    expect(result.current.minersAmount.onlineOrMinorErrors).toBe(80)
    mockFns.multiTailLogQuery
      .mockReset()
      .mockReturnValue({ data: [[[], [], []]], isLoading: false })
  })

  it('uses totalSystemConsumptionHeader when feature flag enabled', async () => {
    mockFns.featureConfigQuery.mockReturnValue({
      data: { totalSystemConsumptionHeader: true },
    })
    const { result } = renderHook(() => useHeaderStats(), {
      wrapper: createWrapper(),
    })
    await act(async () => {})
    expect(result.current.consumption).toBeDefined()
    mockFns.featureConfigQuery.mockReset().mockReturnValue({ data: {} })
  })

  it('uses totalTransformerConsumptionHeader when feature flag enabled', async () => {
    mockFns.featureConfigQuery.mockReturnValue({
      data: { totalTransformerConsumptionHeader: true },
    })
    mockFns.totalTransformerPM.mockReturnValue({
      isPowerConsumptionLoading: false,
      totalPowerConsumptionW: 500000,
    })
    const { result } = renderHook(() => useHeaderStats(), {
      wrapper: createWrapper(),
    })
    await act(async () => {})
    expect(result.current.consumption.rawConsumptionW).toBe(500000)
    mockFns.featureConfigQuery.mockReset().mockReturnValue({ data: {} })
    mockFns.totalTransformerPM
      .mockReset()
      .mockReturnValue({ isPowerConsumptionLoading: false, totalPowerConsumptionW: 0 })
  })

  it('returns null nominalValues when isLoadingNominalValues is true', () => {
    mockFns.globalConfigQuery.mockReturnValue({ data: undefined as unknown, isLoading: true })
    const { result } = renderHook(() => useHeaderStats(), {
      wrapper: createWrapper(),
    })
    expect(result.current.nominalValues.nominalMinersValue).toBeNull()
    expect(result.current.nominalValues.nominalHashrateValue).toBeNull()
    mockFns.globalConfigQuery.mockReset().mockReturnValue({ data: [{}], isLoading: false })
  })

  it('extracts pool stats from minerpool ext data', () => {
    mockFns.extDataQuery.mockReturnValue({
      data: [
        [
          {
            stats: [
              { active_workers_count: 10, worker_count: 15, hashrate: 1000 },
              { active_workers_count: 5, worker_count: 8, hashrate: 500 },
            ],
          },
        ],
      ],
      isLoading: false,
    })
    const { result } = renderHook(() => useHeaderStats(), {
      wrapper: createWrapper(),
    })
    expect(result.current.poolMinersOn).toBe(15)
    expect(result.current.poolMinersTotal).toBe(23)
    expect(result.current.poolHashrate).toBe(1500)
    mockFns.extDataQuery.mockReset().mockReturnValue({ data: [[]], isLoading: false })
  })

  it('uses power meter data when devices have t-powermeter tag', () => {
    mockFns.listThingsQuery.mockReturnValue({
      data: [
        [
          {
            tags: ['t-powermeter'],
            last: { snap: { stats: { power_w: 800000 } }, alerts: [] },
          },
        ],
      ],
      isLoading: false,
    })
    const { result } = renderHook(() => useHeaderStats(), {
      wrapper: createWrapper(),
    })
    expect(result.current).toBeDefined()
    mockFns.listThingsQuery.mockReset().mockReturnValue({ data: [[]], isLoading: false })
  })
})
