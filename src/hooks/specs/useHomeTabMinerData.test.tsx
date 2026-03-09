import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useHomeTabMinerData } from '../useHomeTabMinerData'

vi.mock('@/app/services/api', () => ({
  useGetTailLogQuery: () => ({
    data: [[]],
    isLoading: false,
    isError: false,
    error: undefined,
  }),
}))
vi.mock('../useSmartPolling', () => ({ useSmartPolling: () => 5000 }))
vi.mock('@/Views/Container/Tabs/HomeTab/HomeTab.util', () => ({
  getAlarms: () => [],
  getContainerFormatedAlerts: () => [],
  getAlertTimelineItems: () => [],
  getAntspacePowerBoxData: () => ({}),
  getAntspaceImmersionPowerBoxData: () => ({}),
  getElectricPowerBoxData: () => ({}),
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
})
