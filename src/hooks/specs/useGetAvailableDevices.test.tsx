import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useGetAvailableDevices } from '../useGetAvailableDevices'

let mockQueryData: unknown[] = []

vi.mock('@/app/services/api', () => ({
  useGetListThingsQuery: () => ({ data: mockQueryData }),
}))

describe('useGetAvailableDevices', () => {
  it('returns empty arrays when no data', () => {
    mockQueryData = []
    const { result } = renderHook(() => useGetAvailableDevices())
    expect(result.current).toHaveProperty('availableContainerTypes')
    expect(result.current).toHaveProperty('availableMinerTypes')
    expect(Array.isArray(result.current.availableContainerTypes)).toBe(true)
    expect(Array.isArray(result.current.availableMinerTypes)).toBe(true)
    expect(result.current.availableContainerTypes).toHaveLength(0)
    expect(result.current.availableMinerTypes).toHaveLength(0)
  })

  it('classifies container devices when data contains container types', () => {
    // The hook takes _head of the raw data, then _forEach over its values
    // So data[0] should be a record of device objects
    mockQueryData = [{ device1: { type: 'container-bd-d40-a1346' } }]
    const { result } = renderHook(() => useGetAvailableDevices())
    expect(result.current.availableContainerTypes).toContain('container-bd-d40-a1346')
    expect(result.current.availableMinerTypes).toHaveLength(0)
  })

  it('classifies miner devices when data contains miner types', () => {
    // isMiner() checks _startsWith(type, 'miner-')
    mockQueryData = [{ device1: { type: 'miner-am-s19xp' } }]
    const { result } = renderHook(() => useGetAvailableDevices())
    expect(result.current.availableMinerTypes).toContain('miner-am-s19xp')
    expect(result.current.availableContainerTypes).toHaveLength(0)
  })

  it('handles undefined device type without crashing', () => {
    mockQueryData = [{ device1: { type: undefined } }]
    const { result } = renderHook(() => useGetAvailableDevices())
    expect(result.current.availableContainerTypes).toHaveLength(0)
    expect(result.current.availableMinerTypes).toHaveLength(0)
  })
})
