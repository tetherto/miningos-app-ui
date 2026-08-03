import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useListViewFilters } from '../useListViewFilters'

import type { FilterSelectionTuple } from '@/Components/Explorer/List/ListViewFilter/ListViewFilter.types'

vi.mock('../useGetAvailableDevices', () => ({
  useGetAvailableDevices: () => ({
    devices: [{ type: 'miner.antminer', count: 10 }],
    isLoading: false,
  }),
}))

vi.mock('@/app/utils/actionUtils', () => ({
  getTypeFiltersForSite: vi.fn(() => [
    { value: 'miner', children: [{ value: 'antminer', label: 'Antminer' }] },
  ]),
}))

vi.mock('@/Components/Explorer/List/ListView.util', () => ({
  getFilterOptionsByTab: vi.fn(() => [
    { value: 'type', label: 'Type', order: 1 },
    { value: 'status', label: 'Status', order: 2, children: [] },
  ]),
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

  it('onFiltersChange groups selections by key', () => {
    const { result } = renderHook(() =>
      useListViewFilters({ site: 'site-1', selectedType: 'miner' }),
    )

    act(() => {
      result.current.onFiltersChange([
        ['status', 'online', undefined] as unknown as FilterSelectionTuple,
      ])
    })

    expect(result.current.filters).toEqual({ status: ['online'] })
  })

  it('onFiltersChange handles childValue when present', () => {
    const { result } = renderHook(() =>
      useListViewFilters({ site: 'site-1', selectedType: 'miner' }),
    )

    act(() => {
      result.current.onFiltersChange([['type', 'miner', 'antminer']])
    })

    expect(result.current.filters).toEqual({ type: ['antminer'] })
  })

  it('onFiltersChange removes last.alerts when more than one alert selected', () => {
    const { result } = renderHook(() =>
      useListViewFilters({ site: 'site-1', selectedType: 'miner' }),
    )

    act(() => {
      result.current.onFiltersChange([
        ['last.alerts', 'alert1', undefined] as unknown as FilterSelectionTuple,
        ['last.alerts', 'alert2', undefined] as unknown as FilterSelectionTuple,
      ])
    })

    expect(result.current.filters?.['last.alerts']).toBeUndefined()
  })

  it('onFiltersChange keeps last.alerts when exactly one alert selected', () => {
    const { result } = renderHook(() =>
      useListViewFilters({ site: 'site-1', selectedType: 'miner' }),
    )

    act(() => {
      result.current.onFiltersChange([
        ['last.alerts', 'alert1', undefined] as unknown as FilterSelectionTuple,
      ])
    })

    expect(result.current.filters?.['last.alerts']).toEqual(['alert1'])
  })

  it('resets filters when selectedType changes', () => {
    const { result, rerender } = renderHook(
      ({ selectedType }) => useListViewFilters({ site: 'site-1', selectedType }),
      { initialProps: { selectedType: 'miner' } },
    )

    act(() => {
      result.current.onFiltersChange([
        ['status', 'online', undefined] as unknown as FilterSelectionTuple,
      ])
    })
    expect(result.current.filters).toBeDefined()

    rerender({ selectedType: 'container' })

    expect(result.current.filters).toBeUndefined()
  })
})
