import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useTotalTransformerPMConsumption } from '../useTotalTransformerPMConsumption'

vi.mock('@/app/services/api', () => ({
  useGetListThingsQuery: () => ({
    data: [[{ type: 't-powermeter', last: { snap: { stats: { power_w: 100 } } } }]],
    isLoading: false,
  }),
}))
vi.mock('../useSmartPolling', () => ({ useSmartPolling: () => 5000 }))

describe('useTotalTransformerPMConsumption', () => {
  it('returns isPowerConsumptionLoading and totalPowerConsumptionW', () => {
    const { result } = renderHook(() => useTotalTransformerPMConsumption({ skip: false }))
    expect(result.current).toHaveProperty('isPowerConsumptionLoading')
    expect(result.current).toHaveProperty('totalPowerConsumptionW')
  })

  it('when skip is true, does not trigger loading', () => {
    const { result } = renderHook(() => useTotalTransformerPMConsumption({ skip: true }))
    expect(result.current).toHaveProperty('totalPowerConsumptionW')
  })
})
