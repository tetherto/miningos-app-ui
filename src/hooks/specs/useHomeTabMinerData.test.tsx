import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useHomeTabMinerData } from '../useHomeTabMinerData'

const mockFns = vi.hoisted(() => ({
  isAntspaceHydro: vi.fn(() => false),
  isAntspaceImmersion: vi.fn(() => false),
}))

vi.mock('@/app/services/api', () => ({
  useGetTailLogQuery: () => ({
    data: [{ offline_cnt: 2, hashrate_mhs_1m_group_sum: 100 }],
    isLoading: false,
    isError: false,
    error: undefined,
  }),
}))

vi.mock('../useSmartPolling', () => ({ useSmartPolling: () => 5000 }))

vi.mock('@/app/utils/containerUtils', () => ({
  isAntspaceHydro: mockFns.isAntspaceHydro,
  isAntspaceImmersion: mockFns.isAntspaceImmersion,
}))

vi.mock('@/Views/Container/Tabs/HomeTab/HomeTab.util', () => ({
  getAlarms: vi.fn(() => [{ id: 'alarm-1' }]),
  getContainerFormatedAlerts: vi.fn(() => [{ id: 'alert-1' }]),
  getAlertTimelineItems: vi.fn(() => [{ item: { id: 'timeline-1' }, children: null, dot: null }]),
  getAntspacePowerBoxData: vi.fn(() => ({ type: 'antspace-hydro-data' })),
  getAntspaceImmersionPowerBoxData: vi.fn(() => ({ type: 'antspace-immersion-data' })),
  getElectricPowerBoxData: vi.fn(() => ({ type: 'electric-data' })),
}))

const getFormattedDate = (d: Date) => d.toISOString()
const navigate = vi.fn()

describe('useHomeTabMinerData', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() =>
      useHomeTabMinerData({
        getFormattedDate,
        navigate,
      }),
    )
    expect(result.current).toHaveProperty('minerTailLogItem')
    expect(result.current).toHaveProperty('alarmsDataItems')
    expect(result.current).toHaveProperty('totalSockets')
    expect(result.current).toHaveProperty('getPowerBoxData')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('isError')
    expect(result.current).toHaveProperty('error')
    expect(Array.isArray(result.current.alarmsDataItems)).toBe(true)
  })

  it('returns minerTailLogItem from head of data', () => {
    const { result } = renderHook(() =>
      useHomeTabMinerData({
        getFormattedDate,
        navigate,
      }),
    )
    expect(result.current.minerTailLogItem).toEqual({
      offline_cnt: 2,
      hashrate_mhs_1m_group_sum: 100,
    })
  })

  it('sets totalSockets from data.info.nominalMinerCapacity', () => {
    const { result } = renderHook(() =>
      useHomeTabMinerData({
        data: { info: { nominalMinerCapacity: 48 } } as unknown as Parameters<
          typeof useHomeTabMinerData
        >[0]['data'],
        getFormattedDate,
        navigate,
      }),
    )
    expect(result.current.totalSockets).toBe(48)
  })

  it('getPowerBoxData uses getElectricPowerBoxData for normal containers', () => {
    mockFns.isAntspaceHydro.mockReturnValue(false)
    mockFns.isAntspaceImmersion.mockReturnValue(false)

    const { result } = renderHook(() =>
      useHomeTabMinerData({
        getFormattedDate,
        navigate,
      }),
    )
    const powerData = result.current.getPowerBoxData({ type: 'container.pod' })
    expect(powerData).toEqual({ type: 'electric-data' })
  })

  it('getPowerBoxData uses getAntspacePowerBoxData for antspace hydro containers', () => {
    mockFns.isAntspaceHydro.mockReturnValueOnce(true)

    const { result } = renderHook(() =>
      useHomeTabMinerData({
        getFormattedDate,
        navigate,
      }),
    )
    const powerData = result.current.getPowerBoxData({ type: 'container.antspace-hydro' })
    expect(powerData).toEqual({ type: 'antspace-hydro-data' })
  })

  it('getPowerBoxData uses getAntspaceImmersionPowerBoxData for antspace immersion containers', () => {
    mockFns.isAntspaceHydro.mockReturnValueOnce(false)
    mockFns.isAntspaceImmersion.mockReturnValueOnce(true)

    const { result } = renderHook(() =>
      useHomeTabMinerData({
        getFormattedDate,
        navigate,
      }),
    )
    const powerData = result.current.getPowerBoxData({ type: 'container.antspace-immersion' })
    expect(powerData).toEqual({ type: 'antspace-immersion-data' })
  })
})
