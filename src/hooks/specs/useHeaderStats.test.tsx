import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { useHeaderStats } from '../useHeaderStats'

import { timezoneSlice } from '@/app/slices/timezoneSlice'

vi.mock('@/app/services/api', () => {
  const empty: unknown[] = []
  return {
    useGetExtDataQuery: () => ({ data: [empty], isLoading: false }),
    useGetGlobalConfigQuery: () => ({ data: [{}], isLoading: false }),
    useGetListThingsQuery: () => ({ data: [empty], isLoading: false }),
    useGetMultiTailLogQuery: () => ({ data: [empty, empty, empty], isLoading: false }),
    useGetTailLogQuery: () => ({ data: [empty], isLoading: false }),
    useGetFeatureConfigQuery: () => ({ data: {} }),
  }
})
vi.mock('../useSmartPolling', () => ({ useSmartPolling: () => 5000 }))
vi.mock('../useSubtractedTime', () => ({ default: () => Date.now() }))
vi.mock('../useTimezone', () => {
  const getFormattedDate = () => ''
  return { default: () => ({ getFormattedDate }) }
})
vi.mock('../useTotalTransformerPMConsumption', () => ({
  useTotalTransformerPMConsumption: () => ({
    isPowerConsumptionLoading: false,
    totalPowerConsumptionW: 0,
  }),
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
})
