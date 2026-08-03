import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useInventoryPagination } from '../useInventoryPagination'

describe('useInventoryPagination', () => {
  const storageKey = 'test-inventory-pagination'

  afterEach(() => {
    sessionStorage.clear()
  })

  it('returns pagination state and handlePaginationChange', () => {
    const { result } = renderHook(() => useInventoryPagination({ storageKey, defaultPageSize: 10 }))
    expect(result.current).toHaveProperty('pagination')
    expect(result.current).toHaveProperty('handlePaginationChange')
    expect(result.current.pagination).toMatchObject({
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
    })
  })

  it('handlePaginationChange updates pageSize and resets to page 1 when pageSize changes', async () => {
    const { result } = renderHook(() =>
      useInventoryPagination({ storageKey: 'test-2', defaultPageSize: 10 }),
    )
    act(() => {
      result.current.handlePaginationChange(2, 20)
    })
    await waitFor(() => {
      expect(result.current.pagination.pageSize).toBe(20)
      // Hook resets to page 1 when pageSize changes
      expect(result.current.pagination.current).toBe(1)
    })
  })

  it('handlePaginationChange updates only page when pageSize unchanged', async () => {
    const { result } = renderHook(() =>
      useInventoryPagination({ storageKey: 'test-3', defaultPageSize: 10 }),
    )
    act(() => {
      result.current.handlePaginationChange(2, 10)
    })
    await waitFor(() => {
      expect(result.current.pagination.current).toBe(2)
      expect(result.current.pagination.pageSize).toBe(10)
    })
  })

  it('persists pageSize to sessionStorage', () => {
    const key = 'test-persist'
    const { result } = renderHook(() =>
      useInventoryPagination({ storageKey: key, defaultPageSize: 10 }),
    )
    act(() => {
      result.current.handlePaginationChange(1, 50)
    })
    expect(sessionStorage.getItem(key)).toBe('50')
  })
})
