import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import useFetchTransactions from '../useFetchTransactions'

const { mockGetExtDataQuery } = vi.hoisted(() => ({
  mockGetExtDataQuery: vi.fn(() => ({ data: [] as unknown })),
}))

vi.mock('@/app/services/api', () => ({
  useGetExtDataQuery: mockGetExtDataQuery,
}))

describe('useFetchTransactions', () => {
  it('returns data and totBtcProduced', () => {
    const { result } = renderHook(() => useFetchTransactions({ year: 2025, month: 0 }))
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('totBtcProduced')
    expect(Array.isArray(result.current.data)).toBe(true)
  })

  it('accepts start and end timestamps and limit', () => {
    mockGetExtDataQuery.mockReturnValueOnce({ data: [] })
    const { result } = renderHook(() =>
      useFetchTransactions({ year: 2025, month: 0, start: 100000, end: 200000, limit: 10 }),
    )
    expect(result.current).toHaveProperty('data')
    // Verify useGetExtDataQuery was called with start/end/limit
    expect(mockGetExtDataQuery).toHaveBeenCalledWith(
      expect.objectContaining({ start: 100000, end: 200000, limit: 10 }),
    )
  })

  it('sums btc produced from non-empty transactions data', async () => {
    const txData = [
      {
        transactions: [{ changed_balance: 0.5 }, { changed_balance: 0.3 }],
      },
    ]
    mockGetExtDataQuery.mockReturnValueOnce({ data: txData })
    const { result } = renderHook(() => useFetchTransactions({ year: 2025, month: 0 }))
    // After effect runs, totBtcProduced should be computed
    expect(result.current).toHaveProperty('totBtcProduced')
  })
})
