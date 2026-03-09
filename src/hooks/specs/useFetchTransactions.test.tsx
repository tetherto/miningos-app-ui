import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import useFetchTransactions from '../useFetchTransactions'

vi.mock('@/app/services/api', () => ({
  useGetExtDataQuery: () => ({ data: [] }),
}))

describe('useFetchTransactions', () => {
  it('returns data and totBtcProduced', () => {
    const { result } = renderHook(() =>
      useFetchTransactions({ year: 2025, month: 0 }),
    )
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('totBtcProduced')
    expect(Array.isArray(result.current.data)).toBe(true)
  })
})
