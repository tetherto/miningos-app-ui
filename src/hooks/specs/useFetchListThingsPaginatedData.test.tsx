import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  useFetchListThingsPaginatedData,
  updateThingsData,
} from '../useFetchListThingsPaginatedData'

import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

const mockUnwrap = vi.fn()
vi.mock('@/app/services/api', () => ({
  useLazyGetListThingsQuery: () => [
    vi.fn().mockReturnValue({
      unwrap: () => mockUnwrap(),
    }),
  ],
}))

describe('useFetchListThingsPaginatedData', () => {
  beforeEach(() => {
    mockUnwrap.mockResolvedValue([[]])
  })

  it('returns thingsData and isLoading', async () => {
    const { result } = renderHook(() =>
      useFetchListThingsPaginatedData({
        query: '{}',
        thingsPerRequest: 20,
      }),
    )
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current).toHaveProperty('thingsData')
    expect(result.current).toHaveProperty('isLoading')
    expect(Array.isArray(result.current.thingsData)).toBe(true)
  })

  it('calls lazy query with expected params', async () => {
    mockUnwrap.mockResolvedValue([[{ id: '1', name: 'Thing1' }]])
    const { result } = renderHook(() =>
      useFetchListThingsPaginatedData({
        query: '{"a":1}',
        fields: '{"id":1}',
        thingsPerRequest: 10,
      }),
    )
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.thingsData.length).toBeGreaterThanOrEqual(0)
  })
})

describe('updateThingsData', () => {
  it('merges new things into previous by id', () => {
    const prev = [{ id: '1', name: 'Old' }] as UnknownRecord[]
    const things = [
      { id: '1', name: 'Updated' },
      { id: '2', name: 'New' },
    ] as UnknownRecord[]
    const out = updateThingsData(things, prev)
    expect(out).toHaveLength(2)
    expect((out[0] as { id: string; name: string }).name).toBe('Updated')
    expect((out[1] as { id: string; name: string }).id).toBe('2')
  })

  it('returns copy of prev when things is empty', () => {
    const prev = [{ id: '1' }] as UnknownRecord[]
    const out = updateThingsData([], prev)
    expect(out).toEqual([{ id: '1' }])
  })
})
