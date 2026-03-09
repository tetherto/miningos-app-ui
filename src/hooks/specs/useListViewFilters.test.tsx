import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useListViewFilters } from '../useListViewFilters'

vi.mock('../useGetAvailableDevices', () => ({
  useGetAvailableDevices: () => ({ devices: [], isLoading: false }),
}))

describe('useListViewFilters', () => {
  it('returns filter options and handlers when site is provided', () => {
    const { result } = renderHook(() =>
      useListViewFilters({ site: 'site-1', selectedType: 'miner' }),
    )
    expect(result.current).toHaveProperty('listViewFilterOptions')
    expect(result.current).toHaveProperty('onFiltersChange')
    expect(result.current).toHaveProperty('filters')
    expect(result.current).toHaveProperty('previousFilters')
    expect(Array.isArray(result.current.listViewFilterOptions)).toBe(true)
  })

  it('returns empty filter options when site is undefined', () => {
    const { result } = renderHook(() => useListViewFilters({}))
    expect(result.current.listViewFilterOptions).toEqual([])
  })
})
