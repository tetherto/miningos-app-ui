import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useGetAvailableDevices } from '../useGetAvailableDevices'

vi.mock('@/app/services/api', () => ({
  useGetListThingsQuery: () => ({ data: [] }),
}))

describe('useGetAvailableDevices', () => {
  it('returns availableContainerTypes and availableMinerTypes', () => {
    const { result } = renderHook(() => useGetAvailableDevices())
    expect(result.current).toHaveProperty('availableContainerTypes')
    expect(result.current).toHaveProperty('availableMinerTypes')
    expect(Array.isArray(result.current.availableContainerTypes)).toBe(true)
    expect(Array.isArray(result.current.availableMinerTypes)).toBe(true)
  })
})
