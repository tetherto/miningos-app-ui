import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  getGroupRangeFromDateRange,
  getStatKeyFromDateRange,
  useHashrateData,
} from '../useHashrateData'

import { DATE_RANGE } from '@/constants'
import {
  STAT_3_HOURS,
  STAT_5_MINUTES,
  STAT_KEY_THRESHOLD_DAYS,
} from '@/constants/tailLogStatKeys.constants'

const mockTailLogQuery = vi.fn()

vi.mock('@/app/services/api', () => ({
  useGetTailLogQuery: (...args: unknown[]) => mockTailLogQuery(...args),
}))

describe('useHashrateData', () => {
  describe('getGroupRangeFromDateRange', () => {
    it('returns H1 for range <= 1 day', () => {
      const start = new Date('2025-01-01T00:00:00')
      const end = new Date('2025-01-01T12:00:00')
      expect(getGroupRangeFromDateRange(start, end)).toBe(DATE_RANGE.H1)
    })

    it('returns D1 for range <= 30 days', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-01-15')
      expect(getGroupRangeFromDateRange(start, end)).toBe(DATE_RANGE.D1)
    })

    it('returns W1 for range > 30 days', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-02-15')
      expect(getGroupRangeFromDateRange(start, end)).toBe(DATE_RANGE.W1)
    })
  })

  describe('getStatKeyFromDateRange', () => {
    it('returns STAT_5_MINUTES for short range', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-01-02')
      expect(getStatKeyFromDateRange(start, end)).toBe(STAT_5_MINUTES)
    })

    it('returns STAT_3_HOURS for range > threshold days', () => {
      const start = new Date('2025-01-01')
      const end = new Date(
        new Date('2025-01-01').getTime() + (STAT_KEY_THRESHOLD_DAYS + 2) * 86400000,
      )
      expect(getStatKeyFromDateRange(start, end)).toBe(STAT_3_HOURS)
    })
  })

  describe('useHashrateData hook', () => {
    it('returns data, isLoading, error, refetch, queryParams', () => {
      mockTailLogQuery.mockReturnValue({
        data: [[{ ts: 1, val: 100 }]],
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      })
      const start = new Date('2025-01-01').getTime()
      const end = new Date('2025-01-07').getTime()
      const { result } = renderHook(() => useHashrateData({ dateRange: { start, end } }))
      expect(result.current).toHaveProperty('data')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('refetch')
      expect(result.current).toHaveProperty('queryParams')
    })

    it('flattens nested array data (first ORK)', () => {
      const innerData = [{ ts: 1, val: 100 }]
      mockTailLogQuery.mockReturnValue({
        data: [innerData],
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      })
      const { result } = renderHook(() =>
        useHashrateData({ dateRange: { start: Date.now() - 86400000, end: Date.now() } }),
      )
      expect(result.current.data).toBe(innerData)
    })

    it('returns raw data when not nested array', () => {
      const rawData = [{ ts: 1, val: 100 }]
      mockTailLogQuery.mockReturnValue({
        data: rawData,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      })
      const { result } = renderHook(() =>
        useHashrateData({ dateRange: { start: Date.now() - 86400000, end: Date.now() } }),
      )
      expect(result.current.data).toBe(rawData)
    })

    it('uses default date range when no dateRange param provided', () => {
      mockTailLogQuery.mockReturnValue({
        data: undefined as unknown,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      })
      const { result } = renderHook(() => useHashrateData())
      expect(result.current.queryParams).toHaveProperty('start')
      expect(result.current.queryParams).toHaveProperty('end')
    })

    it('sets isLoading true when isFetching is true', () => {
      mockTailLogQuery.mockReturnValue({
        data: undefined as unknown,
        isLoading: false,
        isFetching: true,
        error: null,
        refetch: vi.fn(),
      })
      const { result } = renderHook(() =>
        useHashrateData({ dateRange: { start: Date.now() - 86400000, end: Date.now() } }),
      )
      expect(result.current.isLoading).toBe(true)
    })

    it('passes skip=true to query when skip param is true', () => {
      mockTailLogQuery.mockReturnValue({
        data: undefined as unknown,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      })
      renderHook(() =>
        useHashrateData({
          dateRange: { start: Date.now() - 86400000, end: Date.now() },
          skip: true,
        }),
      )
      expect(mockTailLogQuery).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ skip: true }),
      )
    })
  })
})
