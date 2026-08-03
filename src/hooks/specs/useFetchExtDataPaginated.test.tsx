import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useFetchExtDataPaginated } from '../useFetchExtDataPaginated'

const mockUnwrap = vi.fn()
vi.mock('@/app/services/api', () => ({
  useLazyGetExtDataQuery: () => [
    vi.fn().mockReturnValue({
      unwrap: () => mockUnwrap(),
    }),
  ],
}))

describe('useFetchExtDataPaginated', () => {
  beforeEach(() => {
    mockUnwrap.mockResolvedValue([[]])
  })

  it('returns data, loading flags, error, and refetch when skip is true', () => {
    const { result } = renderHook(() =>
      useFetchExtDataPaginated({
        type: 'minerpool',
        queryKey: 'stats',
        skip: true,
      }),
    )
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('isInitialLoading')
    expect(result.current).toHaveProperty('isFetchingMore')
    expect(result.current).toHaveProperty('isError')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('refetch')
    expect(result.current.isLoading).toBe(false)
  })

  it('when skip is false, fetches and updates loading state', async () => {
    mockUnwrap.mockResolvedValue([[{ ts: Date.now() }]])
    const { result } = renderHook(() =>
      useFetchExtDataPaginated({
        type: 'minerpool',
        queryKey: 'stats',
        skip: false,
      }),
    )
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false)
      },
      { timeout: 3000 },
    )
    expect(result.current.refetch).toBeDefined()
  })
})
