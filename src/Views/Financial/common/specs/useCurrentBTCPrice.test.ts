import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

const mockFns = vi.hoisted(() => ({
  extDataQuery: vi.fn(() => ({
    data: undefined as unknown,
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/app/services/api', () => ({
  useGetExtDataQuery: mockFns.extDataQuery,
}))

import { buildCurrentBtcParams, useCurrentBTCPrice } from '../useCurrentBTCPrice'

describe('buildCurrentBtcParams', () => {
  it('returns type: mempool', () => {
    expect(buildCurrentBtcParams()).toEqual({ type: 'mempool' })
  })
})

describe('useCurrentBTCPrice', () => {
  it('returns currentBTCPrice=0 when data is undefined', () => {
    const { result } = renderHook(() => useCurrentBTCPrice())
    expect(result.current.currentBTCPrice).toBe(0)
    expect(result.current).toHaveProperty('isLoading')
  })

  it('returns currentBTCPrice=0 when data is not an array', () => {
    mockFns.extDataQuery.mockReturnValueOnce({ data: {}, isLoading: false, error: null })
    const { result } = renderHook(() => useCurrentBTCPrice())
    expect(result.current.currentBTCPrice).toBe(0)
  })

  it('returns currentBTCPrice from nested array data', () => {
    const btcData = { currentPrice: 45000 }
    mockFns.extDataQuery.mockReturnValueOnce({
      data: [[btcData]],
      isLoading: false,
      error: null,
    })
    const { result } = renderHook(() => useCurrentBTCPrice())
    expect(result.current.currentBTCPrice).toBe(45000)
  })

  it('returns currentBTCPrice=0 when first item is empty array', () => {
    mockFns.extDataQuery.mockReturnValueOnce({ data: [[]], isLoading: false, error: null })
    const { result } = renderHook(() => useCurrentBTCPrice())
    expect(result.current.currentBTCPrice).toBe(0)
  })

  it('returns currentBTCPrice=0 when first nested item has no currentPrice', () => {
    mockFns.extDataQuery.mockReturnValueOnce({
      data: [[{ priceChange24Hrs: 100 }]],
      isLoading: false,
      error: null,
    })
    const { result } = renderHook(() => useCurrentBTCPrice())
    expect(result.current.currentBTCPrice).toBe(0)
  })

  it('returns currentBTCPrice=0 when outer array is empty', () => {
    mockFns.extDataQuery.mockReturnValueOnce({ data: [], isLoading: false, error: null })
    const { result } = renderHook(() => useCurrentBTCPrice())
    expect(result.current.currentBTCPrice).toBe(0)
  })

  it('returns currentBTCPrice=0 when first item is not an array', () => {
    mockFns.extDataQuery.mockReturnValueOnce({
      data: [{ currentPrice: 1000 }],
      isLoading: false,
      error: null,
    })
    const { result } = renderHook(() => useCurrentBTCPrice())
    expect(result.current.currentBTCPrice).toBe(0)
  })
})
