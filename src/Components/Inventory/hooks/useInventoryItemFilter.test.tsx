import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useInventoryItemFilter from './useInventoryItemFilter'

describe('useInventoryItemFilter', () => {
  const items = [
    { id: 1, code: '1111', user: 'Alice' },
    { id: 2, code: '2222', user: 'Bob' },
    { id: 3, code: '3333', user: 'Charlie' },
  ]

  const attributes = ['code', 'user']

  let setFilteredItems: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setFilteredItems = vi.fn()
  })

  const createEvent = (value: string) =>
    ({
      target: { value },
    }) as React.ChangeEvent<HTMLInputElement>

  it('returns all items when search text is empty', () => {
    const { result } = renderHook(() =>
      useInventoryItemFilter({
        setFilteredItems,
        allItems: items,
        attributes,
      }),
    )

    result.current.handleFilterSelect(createEvent(''))

    expect(setFilteredItems).toHaveBeenCalledWith(items)
  })

  it('filters items by matching attribute value', () => {
    const { result } = renderHook(() =>
      useInventoryItemFilter({
        setFilteredItems,
        allItems: items,
        attributes,
      }),
    )

    result.current.handleFilterSelect(createEvent('1111'))

    expect(setFilteredItems).toHaveBeenCalledWith([{ id: 1, code: '1111', user: 'Alice' }])
  })

  it('is case-insensitive', () => {
    const { result } = renderHook(() =>
      useInventoryItemFilter({
        setFilteredItems,
        allItems: items,
        attributes,
      }),
    )

    result.current.handleFilterSelect(createEvent('alice'))

    expect(setFilteredItems).toHaveBeenCalledWith([{ id: 1, code: '1111', user: 'Alice' }])
  })

  it('trims search text before filtering', () => {
    const { result } = renderHook(() =>
      useInventoryItemFilter({
        setFilteredItems,
        allItems: items,
        attributes,
      }),
    )

    result.current.handleFilterSelect(createEvent('  bob  '))

    expect(setFilteredItems).toHaveBeenCalledWith([{ id: 2, code: '2222', user: 'Bob' }])
  })

  it('returns empty array when no items match', () => {
    const { result } = renderHook(() =>
      useInventoryItemFilter({
        setFilteredItems,
        allItems: items,
        attributes,
      }),
    )

    result.current.handleFilterSelect(createEvent('non-existent'))

    expect(setFilteredItems).toHaveBeenCalledWith([])
  })
})
