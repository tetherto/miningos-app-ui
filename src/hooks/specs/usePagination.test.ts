import { renderHook, act } from '@testing-library/react'

import usePagination from '../usePagination'

describe('usePagination', () => {
  describe('initial state', () => {
    it('defaults to current=1, pageSize=20', () => {
      const { result } = renderHook(() => usePagination())
      expect(result.current.pagination.current).toBe(1)
      expect(result.current.pagination.pageSize).toBe(20)
      expect(result.current.pagination.showSizeChanger).toBe(true)
      expect(result.current.pagination.total).toBe(21)
    })

    it('respects custom initial values', () => {
      const { result } = renderHook(() => usePagination({ current: 3, pageSize: 50 }))
      expect(result.current.pagination.current).toBe(3)
      expect(result.current.pagination.pageSize).toBe(50)
    })

    it('sets total to pageSize + 1 initially', () => {
      const { result } = renderHook(() => usePagination({ pageSize: 15 }))
      expect(result.current.pagination.total).toBe(16)
    })
  })

  describe('queryArgs', () => {
    it('returns limit=pageSize and offset=0 on page 1', () => {
      const { result } = renderHook(() => usePagination({ pageSize: 10 }))
      expect(result.current.queryArgs.limit).toBe(10)
      expect(result.current.queryArgs.offset).toBe(0)
    })

    it('computes correct offset for page 2', () => {
      const { result } = renderHook(() => usePagination({ current: 2, pageSize: 10 }))
      expect(result.current.queryArgs.offset).toBe(10)
    })

    it('computes correct offset for page 3', () => {
      const { result } = renderHook(() => usePagination({ current: 3, pageSize: 25 }))
      expect(result.current.queryArgs.offset).toBe(50)
    })
  })

  describe('hideNextPage', () => {
    it('hides next page when received fewer items than pageSize', () => {
      const { result } = renderHook(() => usePagination({ pageSize: 10 }))
      act(() => {
        result.current.hideNextPage(5)
      })
      // current=1, pageSize=10, size=5 → total = 10 * 1 + 0
      expect(result.current.pagination.total).toBe(10)
    })

    it('shows next page when received full pageSize', () => {
      const { result } = renderHook(() => usePagination({ pageSize: 10 }))
      act(() => {
        result.current.hideNextPage(10)
      })
      // size >= pageSize → total = 10 * 1 + 1 = 11
      expect(result.current.pagination.total).toBe(11)
    })

    it('handles no size argument (hides next page)', () => {
      const { result } = renderHook(() => usePagination({ pageSize: 10 }))
      act(() => {
        result.current.hideNextPage()
      })
      expect(result.current.pagination.total).toBe(10)
    })

    it('handles size=0 (hides next page)', () => {
      const { result } = renderHook(() => usePagination({ pageSize: 10 }))
      act(() => {
        result.current.hideNextPage(0)
      })
      expect(result.current.pagination.total).toBe(10)
    })
  })

  describe('setPagination', () => {
    it('allows directly setting pagination', () => {
      const { result } = renderHook(() => usePagination())
      act(() => {
        result.current.setPagination((prev) => ({ ...prev, current: 5 }))
      })
      expect(result.current.pagination.current).toBe(5)
    })
  })
})
