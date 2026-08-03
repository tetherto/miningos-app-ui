import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildPowerConsumptionParams, usePowerConsumption } from '../usePowerConsumption'

const mockQuery = vi.fn().mockReturnValue({ data: undefined, isLoading: false })

vi.mock('@/app/services/api', () => ({
  useGetTailLogRangeAggrQuery: (arg0: unknown, arg1: unknown) =>
    mockQuery(arg0 as never, arg1 as never),
}))

beforeEach(() => {
  mockQuery.mockReturnValue({ data: undefined, isLoading: false })
})

const START = new Date('2024-01-01T00:00:00Z').getTime()
const END = new Date('2024-01-31T23:59:59Z').getTime()

describe('buildPowerConsumptionParams', () => {
  it('returns keys as JSON string with expected fields', () => {
    const result = buildPowerConsumptionParams({ start: START, end: END })
    expect(result).toHaveProperty('keys')
    const keys = JSON.parse(result.keys)
    expect(Array.isArray(keys)).toBe(true)
    expect(keys[0]).toMatchObject({
      type: 'powermeter',
      fields: { site_power_w: 1 },
      aggrFields: { site_power_w: 1 },
      shouldReturnDailyData: 1,
    })
  })

  it('formats startDate and endDate correctly', () => {
    const result = buildPowerConsumptionParams({ start: START, end: END })
    const keys = JSON.parse(result.keys)
    expect(keys[0].startDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
    expect(keys[0].endDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
  })
})

describe('usePowerConsumption', () => {
  it('returns query result when dateRange is provided', () => {
    const { result } = renderHook(() => usePowerConsumption({ start: START, end: END }))
    expect(result.current).toBeDefined()
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({ keys: expect.any(String) }),
      expect.objectContaining({ skip: false }),
    )
  })

  it('skips query when dateRange is falsy', () => {
    renderHook(() => usePowerConsumption(null as never))
    expect(mockQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ skip: true }))
  })
})
