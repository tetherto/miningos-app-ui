import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildElectricityParams,
  useElectricityCurtailmentData,
} from '../useElectricityCurtailmentData'

const mockQuery = vi.fn().mockReturnValue({ data: undefined, isLoading: false })

vi.mock('@/app/services/api', () => ({
  useGetExtDataQuery: (arg0: unknown, arg1: unknown) => mockQuery(arg0 as never, arg1 as never),
}))

beforeEach(() => {
  mockQuery.mockReturnValue({ data: undefined, isLoading: false })
})

const MS_PER_DAY = 24 * 60 * 60 * 1000
const START = new Date('2024-01-01T00:00:00Z').getTime()

describe('buildElectricityParams', () => {
  it('uses monthly groupRange for date ranges >= 25 days', () => {
    const end = START + 30 * MS_PER_DAY
    const result = buildElectricityParams({ start: START, end })
    const query = JSON.parse(result.query)
    expect(query.groupRange).toBe('1M')
    expect(result.type).toBe('electricity')
  })

  it('uses daily groupRange for date ranges < 25 days', () => {
    const end = START + 7 * MS_PER_DAY
    const result = buildElectricityParams({ start: START, end })
    const query = JSON.parse(result.query)
    expect(query.groupRange).toBe('1D')
  })

  it('includes start, end, and dataInterval in the query', () => {
    const end = START + 7 * MS_PER_DAY
    const result = buildElectricityParams({ start: START, end })
    const query = JSON.parse(result.query)
    expect(query.start).toBe(START)
    expect(query.end).toBe(end)
    expect(query.key).toBe('stats-history')
  })
})

describe('useElectricityCurtailmentData', () => {
  it('returns query result when dateRange is provided', () => {
    const end = START + 7 * MS_PER_DAY
    const { result } = renderHook(() => useElectricityCurtailmentData({ start: START, end }))
    expect(result.current).toBeDefined()
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'electricity' }),
      expect.objectContaining({ skip: false }),
    )
  })

  it('skips query when dateRange is falsy', () => {
    renderHook(() => useElectricityCurtailmentData(null as never))
    expect(mockQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ skip: true }))
  })
})
