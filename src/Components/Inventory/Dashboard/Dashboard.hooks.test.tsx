import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useDashboardData } from './Dashboard.hooks'

vi.mock('@/app/services/api', () => ({
  useGetListThingsQuery: () => ({ data: null, isLoading: false }),
  useGetMultiTailLogQuery: () => ({ data: null, isLoading: false }),
  useGetSiteQuery: () => ({ data: null }),
  useGetTailLogQuery: () => ({ data: null, isLoading: false }),
}))
vi.mock('../../../hooks/useHeaderStats', () => ({
  useHeaderStats: () => ({
    minersAmount: {
      total: 0,
      totalContainerCapacity: 0,
      onlineOrMinorErrors: 0,
      offlineOrSleep: 0,
      majorErrors: 0,
    },
    isLoading: false,
  }),
}))
vi.mock('../../../hooks/useSubtractedTime', () => ({ default: () => 0 }))

describe('useDashboardData', () => {
  it('returns dashboard data shape', () => {
    const { result } = renderHook(() => useDashboardData())
    expect(result.current).toHaveProperty('minersAmount')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('minersTotal')
    expect(result.current).toHaveProperty('minerDistribution')
  })
})
