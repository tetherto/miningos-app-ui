import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useTotalTransformerPMConsumption } from '../useTotalTransformerPMConsumption'

const mockFns = vi.hoisted(() => ({
  getListThings: vi.fn(() => ({
    data: [[{ type: 't-powermeter', last: { snap: { stats: { power_w: 100 } } } }]] as unknown,
    isLoading: false,
  })),
}))

vi.mock('@/app/services/api', () => ({
  useGetListThingsQuery: mockFns.getListThings,
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

  it('sums power for valid transformer powermeters (type: powermeter-1, pos: tr1)', () => {
    mockFns.getListThings.mockReturnValueOnce({
      data: [
        [
          {
            type: 'powermeter-1',
            info: { pos: 'tr1' },
            last: { snap: { stats: { power_w: 500 } } },
          },
          {
            type: 'powermeter-1',
            info: { pos: 'tr2' },
            last: { snap: { stats: { power_w: 300 } } },
          },
        ],
      ],
      isLoading: false,
    })
    const { result } = renderHook(() => useTotalTransformerPMConsumption({ skip: false }))
    expect(result.current.totalPowerConsumptionW).toBe(800)
  })

  it('skips device with no power_w value', () => {
    mockFns.getListThings.mockReturnValueOnce({
      data: [[{ type: 'powermeter-1', info: { pos: 'tr1' }, last: { snap: { stats: {} } } }]],
      isLoading: false,
    })
    const { result } = renderHook(() => useTotalTransformerPMConsumption({ skip: false }))
    expect(result.current.totalPowerConsumptionW).toBe(0)
  })

  it('skips device with non-number power_w', () => {
    mockFns.getListThings.mockReturnValueOnce({
      data: [
        [
          {
            type: 'powermeter-1',
            info: { pos: 'tr1' },
            last: { snap: { stats: { power_w: 'not-a-number' } } },
          },
        ],
      ],
      isLoading: false,
    })
    const { result } = renderHook(() => useTotalTransformerPMConsumption({ skip: false }))
    expect(result.current.totalPowerConsumptionW).toBe(0)
  })

  it('returns 0 when no devices match transformer type', () => {
    mockFns.getListThings.mockReturnValueOnce({
      data: [
        [
          {
            type: 'other-device',
            info: { pos: 'shelf-1' },
            last: { snap: { stats: { power_w: 100 } } },
          },
        ],
      ],
      isLoading: false,
    })
    const { result } = renderHook(() => useTotalTransformerPMConsumption({ skip: false }))
    expect(result.current.totalPowerConsumptionW).toBe(0)
  })

  it('handles empty devices array', () => {
    mockFns.getListThings.mockReturnValueOnce({ data: [[]], isLoading: false })
    const { result } = renderHook(() => useTotalTransformerPMConsumption({ skip: false }))
    expect(result.current.totalPowerConsumptionW).toBe(0)
  })
})
